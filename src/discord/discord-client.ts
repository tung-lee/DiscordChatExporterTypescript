import { request, Dispatcher } from 'undici';
import { Snowflake } from './snowflake.js';
import { TokenKind } from './token-kind.js';
import {
  RateLimitPreference,
  isRateLimitRespected,
} from './rate-limit-preference.js';
import { httpAgent, isRetryableStatusCode } from '../utils/http.js';
import { UrlBuilder } from '../utils/url.js';
import { delay } from '../utils/extensions.js';
import { DiscordChatExporterError } from '../exceptions/discord-chat-exporter-error.js';

// Data models
import {
  Application,
  User,
  Guild,
  Channel,
  ChannelKind,
  Role,
  Member,
  Message,
  Invite,
  Emoji,
} from './data/index.js';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 60000;
const PAGINATION_LIMIT = 100;

/**
 * Progress callback type
 */
export type ProgressCallback = (progress: number) => void;

/**
 * Discord API client for fetching data
 */
export class DiscordClient {
  private readonly token: string;
  private readonly rateLimitPreference: RateLimitPreference;
  private readonly dispatcher: Dispatcher;
  private resolvedTokenKind: TokenKind | null = null;

  constructor(
    token: string,
    rateLimitPreference: RateLimitPreference = RateLimitPreference.RespectAll,
    dispatcher?: Dispatcher
  ) {
    this.token = token;
    this.rateLimitPreference = rateLimitPreference;
    this.dispatcher = dispatcher ?? httpAgent;
  }

  /**
   * Make an HTTP request with retry logic
   */
  private async getResponse(
    url: string,
    tokenKind: TokenKind
  ): Promise<Dispatcher.ResponseData> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await request(`${DISCORD_API_BASE}/${url}`, {
          method: 'GET',
          dispatcher: this.dispatcher,
          headers: {
            Authorization:
              tokenKind === TokenKind.Bot ? `Bot ${this.token}` : this.token,
          },
        });

        // Handle rate limiting
        if (isRateLimitRespected(this.rateLimitPreference, tokenKind)) {
          await this.handleRateLimitHeaders(response);
        }

        // Retry on retryable status codes
        if (isRetryableStatusCode(response.statusCode)) {
          const retryAfter = response.headers['retry-after'];
          const delayMs = retryAfter
            ? parseFloat(String(retryAfter)) * 1000
            : INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);

          await delay(Math.min(delayMs, MAX_RETRY_DELAY_MS));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        // Retry on network errors
        const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
        await delay(Math.min(delayMs, MAX_RETRY_DELAY_MS));
      }
    }

    throw lastError ?? new Error(`Failed to fetch ${url}`);
  }

  /**
   * Handle rate limit headers proactively
   */
  private async handleRateLimitHeaders(
    response: Dispatcher.ResponseData
  ): Promise<void> {
    const remainingHeader = response.headers['x-ratelimit-remaining'];
    const resetAfterHeader = response.headers['x-ratelimit-reset-after'];

    const remaining = remainingHeader
      ? parseInt(String(remainingHeader), 10)
      : null;
    const resetAfter = resetAfterHeader
      ? parseFloat(String(resetAfterHeader))
      : null;

    // If this was the last request available, wait for reset
    if (remaining !== null && remaining <= 0 && resetAfter !== null) {
      // Add a small buffer and cap at max delay
      const bufferSeconds = 1;
      const delayMs = Math.min((resetAfter + bufferSeconds) * 1000, MAX_RETRY_DELAY_MS);
      await delay(delayMs);
    }
  }

  /**
   * Resolve the token kind (User or Bot) by testing authentication
   */
  private async resolveTokenKind(): Promise<TokenKind> {
    if (this.resolvedTokenKind !== null) {
      return this.resolvedTokenKind;
    }

    // Try authenticating as a user
    const userResponse = await this.getResponse('users/@me', TokenKind.User);
    if (userResponse.statusCode !== 401) {
      this.resolvedTokenKind = TokenKind.User;
      // Consume the body to prevent memory leak
      await userResponse.body.text();
      return TokenKind.User;
    }
    await userResponse.body.text();

    // Try authenticating as a bot
    const botResponse = await this.getResponse('users/@me', TokenKind.Bot);
    if (botResponse.statusCode !== 401) {
      this.resolvedTokenKind = TokenKind.Bot;
      await botResponse.body.text();
      return TokenKind.Bot;
    }
    await botResponse.body.text();

    throw new DiscordChatExporterError('Authentication token is invalid.', true);
  }

  /**
   * Make an authenticated request with auto-detected token kind
   */
  private async getAuthenticatedResponse(
    url: string
  ): Promise<Dispatcher.ResponseData> {
    const tokenKind = await this.resolveTokenKind();
    return this.getResponse(url, tokenKind);
  }

  /**
   * Check if HTTP status code indicates success
   */
  private isSuccessStatusCode(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }

  /**
   * Get JSON response with error handling
   */
  private async getJsonResponse(url: string): Promise<Record<string, unknown>> {
    const response = await this.getAuthenticatedResponse(url);
    const body = await response.body.text();

    if (!this.isSuccessStatusCode(response.statusCode)) {
      switch (response.statusCode) {
        case 401:
          throw new DiscordChatExporterError(
            'Authentication token is invalid.',
            true
          );
        case 403:
          throw new DiscordChatExporterError(
            `Request to '${url}' failed: forbidden.`
          );
        case 404:
          throw new DiscordChatExporterError(
            `Request to '${url}' failed: not found.`
          );
        default:
          throw new DiscordChatExporterError(
            `Request to '${url}' failed: ${response.statusCode}. Response: ${body}`,
            true
          );
      }
    }

    return JSON.parse(body) as Record<string, unknown>;
  }

  /**
   * Get JSON response, returning null on 403/404
   */
  private async tryGetJsonResponse(
    url: string
  ): Promise<Record<string, unknown> | null> {
    const response = await this.getAuthenticatedResponse(url);
    const body = await response.body.text();

    if (response.statusCode === 403 || response.statusCode === 404) {
      return null;
    }

    if (!this.isSuccessStatusCode(response.statusCode)) {
      throw new DiscordChatExporterError(
        `Request to '${url}' failed: ${response.statusCode}. Response: ${body}`,
        true
      );
    }

    return JSON.parse(body) as Record<string, unknown>;
  }

  /**
   * Get JSON array response
   */
  private async getJsonArrayResponse(
    url: string
  ): Promise<Record<string, unknown>[]> {
    const response = await this.getJsonResponse(url);
    return response as unknown as Record<string, unknown>[];
  }

  /**
   * Try to get JSON array response
   */
  private async tryGetJsonArrayResponse(
    url: string
  ): Promise<Record<string, unknown>[] | null> {
    const response = await this.tryGetJsonResponse(url);
    return response as unknown as Record<string, unknown>[] | null;
  }

  // ==================
  // Public API Methods
  // ==================

  /**
   * Get the current application (for bot tokens)
   */
  async getApplication(): Promise<Application> {
    const response = await this.getJsonResponse('applications/@me');
    return Application.parse(response);
  }

  /**
   * Try to get a user by ID
   */
  async tryGetUser(userId: Snowflake): Promise<User | null> {
    const response = await this.tryGetJsonResponse(`users/${userId}`);
    return response ? User.parse(response) : null;
  }

  /**
   * Get guilds for the current user
   */
  async *getUserGuilds(): AsyncGenerator<Guild> {
    // Always include the Direct Messages pseudo-guild
    yield Guild.DirectMessages;

    let currentAfter = Snowflake.Zero;

    while (true) {
      const url = new UrlBuilder()
        .setPath('users/@me/guilds')
        .setQueryParameter('limit', String(PAGINATION_LIMIT))
        .setQueryParameter('after', currentAfter.toString())
        .build();

      const response = await this.getJsonArrayResponse(url);

      let count = 0;
      for (const guildJson of response) {
        const guild = Guild.parse(guildJson);
        yield guild;
        currentAfter = guild.id;
        count++;
      }

      if (count === 0) {
        break;
      }
    }
  }

  /**
   * Get a guild by ID
   */
  async getGuild(guildId: Snowflake): Promise<Guild> {
    if (guildId.equals(Guild.DirectMessages.id)) {
      return Guild.DirectMessages;
    }

    const response = await this.getJsonResponse(`guilds/${guildId}`);
    return Guild.parse(response);
  }

  /**
   * Get channels in a guild
   */
  async *getGuildChannels(guildId: Snowflake): AsyncGenerator<Channel> {
    if (guildId.equals(Guild.DirectMessages.id)) {
      // For DMs, get the user's DM channels
      const response = await this.getJsonArrayResponse('users/@me/channels');
      for (const channelJson of response) {
        yield Channel.parse(channelJson);
      }
    } else {
      const response = await this.getJsonArrayResponse(
        `guilds/${guildId}/channels`
      );

      // Sort channels by position, then by ID
      const channelsJson = [...response].sort((a, b) => {
        const posA = (a['position'] as number) ?? 0;
        const posB = (b['position'] as number) ?? 0;
        if (posA !== posB) return posA - posB;

        const idA = Snowflake.parse(a['id'] as string);
        const idB = Snowflake.parse(b['id'] as string);
        return idA.compareTo(idB);
      });

      // Build parent lookup (categories)
      const parentsById = new Map<string, Channel>();
      let categoryPosition = 1;
      for (const json of channelsJson) {
        if ((json['type'] as number) === ChannelKind.GuildCategory) {
          const channel = Channel.parse(json, null, categoryPosition);
          parentsById.set(json['id'] as string, channel);
          categoryPosition++;
        }
      }

      // Yield channels with parent references
      let position = 0;
      for (const channelJson of channelsJson) {
        const parentId = channelJson['parent_id'] as string | null | undefined;
        const parent = parentId ? parentsById.get(parentId) ?? null : null;
        yield Channel.parse(channelJson, parent, position);
        position++;
      }
    }
  }

  /**
   * Get direct message channels for the current user
   */
  async *getDirectMessageChannels(): AsyncGenerator<Channel> {
    const response = await this.getJsonArrayResponse('users/@me/channels');
    for (const channelJson of response) {
      yield Channel.parse(channelJson);
    }
  }

  /**
   * Get roles in a guild
   */
  async *getGuildRoles(guildId: Snowflake): AsyncGenerator<Role> {
    if (guildId.equals(Guild.DirectMessages.id)) {
      return;
    }

    const response = await this.getJsonArrayResponse(`guilds/${guildId}/roles`);
    for (const roleJson of response) {
      yield Role.parse(roleJson);
    }
  }

  /**
   * Try to get a guild member
   */
  async tryGetGuildMember(
    guildId: Snowflake,
    memberId: Snowflake
  ): Promise<Member | null> {
    if (guildId.equals(Guild.DirectMessages.id)) {
      return null;
    }

    const response = await this.tryGetJsonResponse(
      `guilds/${guildId}/members/${memberId}`
    );
    return response ? Member.parse(response, guildId) : null;
  }

  /**
   * Try to get an invite by code
   */
  async tryGetInvite(code: string): Promise<Invite | null> {
    const response = await this.tryGetJsonResponse(`invites/${code}`);
    return response ? Invite.parse(response) : null;
  }

  /**
   * Get a channel by ID
   */
  async getChannel(channelId: Snowflake): Promise<Channel> {
    const response = await this.getJsonResponse(`channels/${channelId}`);

    const parentId = response['parent_id'] as string | null | undefined;

    try {
      const parent = parentId
        ? await this.getChannel(Snowflake.parse(parentId))
        : null;
      return Channel.parse(response, parent);
    } catch (error) {
      // Parent channel may be inaccessible
      if (error instanceof DiscordChatExporterError) {
        return Channel.parse(response);
      }
      throw error;
    }
  }

  /**
   * Get the last message in a channel before a given ID
   */
  private async tryGetLastMessage(
    channelId: Snowflake,
    before?: Snowflake
  ): Promise<Message | null> {
    const url = new UrlBuilder()
      .setPath(`channels/${channelId}/messages`)
      .setQueryParameter('limit', '1')
      .setQueryParameter('before', before?.toString())
      .build();

    const response = await this.getJsonArrayResponse(url);
    return response.length > 0 ? Message.parse(response[0]!) : null;
  }

  /**
   * Get messages in a channel with pagination
   */
  async *getMessages(
    channelId: Snowflake,
    after?: Snowflake,
    before?: Snowflake,
    progress?: ProgressCallback
  ): AsyncGenerator<Message> {
    // Get the last message to calculate progress
    const lastMessage = await this.tryGetLastMessage(channelId, before);
    if (
      lastMessage === null ||
      (after && lastMessage.timestamp < after.toDate())
    ) {
      return;
    }

    let firstMessage: Message | null = null;
    let currentAfter = after ?? Snowflake.Zero;

    while (true) {
      const url = new UrlBuilder()
        .setPath(`channels/${channelId}/messages`)
        .setQueryParameter('limit', String(PAGINATION_LIMIT))
        .setQueryParameter('after', currentAfter.toString())
        .build();

      const response = await this.getJsonArrayResponse(url);

      // Messages are returned newest to oldest, so reverse
      const messages = response.map(Message.parse).reverse();

      if (messages.length === 0) {
        return;
      }

      // Check for Message Content Intent issue
      if (
        messages.every((m) => m.isEmpty) &&
        (await this.resolveTokenKind()) === TokenKind.Bot
      ) {
        const application = await this.getApplication();
        if (!application.isMessageContentIntentEnabled) {
          throw new DiscordChatExporterError(
            'Provided bot account does not have the Message Content Intent enabled.',
            true
          );
        }
      }

      for (const message of messages) {
        if (firstMessage === null) {
          firstMessage = message;
        }

        // Ensure message is in range
        if (message.timestamp > lastMessage.timestamp) {
          return;
        }

        // Report progress
        if (progress && firstMessage) {
          const exportedDuration =
            message.timestamp.getTime() - firstMessage.timestamp.getTime();
          const totalDuration =
            lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime();

          const percentage =
            totalDuration > 0 ? (exportedDuration / totalDuration) * 100 : 100;

          progress(Math.min(percentage, 100));
        }

        yield message;
        currentAfter = message.id;
      }
    }
  }

  /**
   * Get reactions on a message
   */
  async *getMessageReactions(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: Emoji
  ): AsyncGenerator<User> {
    // Build reaction name
    const reactionName = emoji.id
      ? `${emoji.name}:${emoji.id}` // Custom emoji
      : emoji.name; // Standard emoji

    let currentAfter = Snowflake.Zero;

    while (true) {
      const url = new UrlBuilder()
        .setPath(
          `channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(reactionName)}`
        )
        .setQueryParameter('limit', String(PAGINATION_LIMIT))
        .setQueryParameter('after', currentAfter.toString())
        .build();

      const response = await this.tryGetJsonArrayResponse(url);
      if (response === null) {
        return;
      }

      let count = 0;
      for (const userJson of response) {
        const user = User.parse(userJson);
        yield user;
        currentAfter = user.id;
        count++;
      }

      if (count === 0) {
        return;
      }
    }
  }

  /**
   * Get threads in a guild
   */
  async *getGuildThreads(
    guildId: Snowflake,
    includeArchived = false,
    before?: Snowflake,
    after?: Snowflake
  ): AsyncGenerator<Channel> {
    if (guildId.equals(Guild.DirectMessages.id)) {
      return;
    }

    // Get all channels first
    const channels: Channel[] = [];
    for await (const channel of this.getGuildChannels(guildId)) {
      channels.push(channel);
    }

    for await (const thread of this.getChannelThreads(
      channels,
      includeArchived,
      before,
      after
    )) {
      yield thread;
    }
  }

  /**
   * Get threads for a list of channels
   */
  async *getChannelThreads(
    channels: Channel[],
    includeArchived = false,
    before?: Snowflake,
    after?: Snowflake
  ): AsyncGenerator<Channel> {
    // Filter channels that can have threads
    const filteredChannels = channels.filter(
      (c) =>
        !c.isCategory &&
        !c.isVoice &&
        !c.isEmpty &&
        (before === undefined || c.mayHaveMessagesBefore(before))
    );

    const tokenKind = await this.resolveTokenKind();

    if (tokenKind === TokenKind.User) {
      // User accounts use search endpoint
      for (const channel of filteredChannels) {
        const archivedOptions = includeArchived ? [false, true] : [false];

        for (const isArchived of archivedOptions) {
          let currentOffset = 0;

          while (true) {
            const url = new UrlBuilder()
              .setPath(`channels/${channel.id}/threads/search`)
              .setQueryParameter('sort_by', 'last_message_time')
              .setQueryParameter('sort_order', 'desc')
              .setQueryParameter('archived', String(isArchived))
              .setQueryParameter('offset', String(currentOffset))
              .build();

            const response = await this.tryGetJsonResponse(url);
            if (response === null) {
              break;
            }

            const threads = response['threads'] as Record<string, unknown>[];
            let shouldBreak = false;

            for (const threadJson of threads) {
              const thread = Channel.parse(threadJson, channel);

              // Break early if past 'after' boundary
              if (after !== undefined && !thread.mayHaveMessagesAfter(after)) {
                shouldBreak = true;
                break;
              }

              yield thread;
              currentOffset++;
            }

            if (shouldBreak) break;
            if (!(response['has_more'] as boolean)) break;
          }
        }
      }
    } else {
      // Bot accounts use threads endpoint
      const guildIds = new Set<string>();
      for (const channel of filteredChannels) {
        guildIds.add(channel.guildId.toString());
      }

      const parentsById = new Map<string, Channel>();
      for (const channel of filteredChannels) {
        parentsById.set(channel.id.toString(), channel);
      }

      // Active threads
      for (const guildId of guildIds) {
        const response = await this.getJsonResponse(
          `guilds/${guildId}/threads/active`
        );
        const threads = response['threads'] as Record<string, unknown>[];

        for (const threadJson of threads) {
          const parentId = threadJson['parent_id'] as string | null | undefined;
          const parent = parentId ? parentsById.get(parentId) : null;

          if (parent && filteredChannels.includes(parent)) {
            yield Channel.parse(threadJson, parent);
          }
        }
      }

      // Archived threads
      if (includeArchived) {
        for (const channel of filteredChannels) {
          for (const archiveType of ['public', 'private']) {
            let currentBefore = before?.toDate().toISOString();

            while (true) {
              const url = new UrlBuilder()
                .setPath(
                  `channels/${channel.id}/threads/archived/${archiveType}`
                )
                .setQueryParameter('before', currentBefore)
                .build();

              const response = await this.tryGetJsonResponse(url);
              if (response === null) {
                break;
              }

              const threads = response['threads'] as Record<string, unknown>[];

              for (const threadJson of threads) {
                const thread = Channel.parse(threadJson, channel);
                yield thread;

                const metadata = threadJson['thread_metadata'] as Record<
                  string,
                  unknown
                >;
                currentBefore = metadata['archive_timestamp'] as string;
              }

              if (!(response['has_more'] as boolean)) {
                break;
              }
            }
          }
        }
      }
    }
  }
}
