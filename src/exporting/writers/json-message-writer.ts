import { MessageWriter } from './message-writer.js';
import { PlainTextMarkdownVisitor } from './plain-text-markdown-visitor.js';
import { ExportContext } from '../export-context.js';
import { Message } from '../../discord/data/message.js';
import { User } from '../../discord/data/user.js';
import { Role } from '../../discord/data/role.js';
import { Emoji } from '../../discord/data/emoji.js';
import { Embed } from '../../discord/data/embeds/embed.js';
import { EmbedAuthor } from '../../discord/data/embeds/embed-author.js';
import { EmbedImage } from '../../discord/data/embeds/embed-image.js';
import { EmbedVideo } from '../../discord/data/embeds/embed-video.js';
import { EmbedFooter } from '../../discord/data/embeds/embed-footer.js';
import { EmbedField } from '../../discord/data/embeds/embed-field.js';
import { extractEmojis } from '../../markdown/parsing/markdown-parser.js';

/**
 * Message writer for JSON format
 */
export class JsonMessageWriter extends MessageWriter {
  private jsonMessages: unknown[] = [];
  private preambleData: {
    guild: unknown;
    channel: unknown;
    dateRange: unknown;
    exportedAt: string;
  } | null = null;

  constructor(filePath: string, context: ExportContext) {
    super(filePath, context);
  }

  private async formatMarkdown(markdown: string): Promise<string> {
    if (this.context.request.shouldFormatMarkdown) {
      return PlainTextMarkdownVisitor.format(this.context, markdown);
    }
    return markdown;
  }

  private async buildUserJson(user: User, includeRoles = true): Promise<unknown> {
    const member = this.context.tryGetMember(user.id);
    const color = this.context.tryGetUserColor(user.id);

    const obj: Record<string, unknown> = {
      id: user.id.toString(),
      name: user.name,
      discriminator: user.discriminatorFormatted,
      nickname: member?.displayName ?? user.displayName,
      color: color?.toHex() ?? null,
      isBot: user.isBot,
    };

    if (includeRoles) {
      obj.roles = this.buildRolesJson(this.context.getUserRoles(user.id));
    }

    obj.avatarUrl = await this.context.resolveAssetUrl(member?.avatarUrl ?? user.avatarUrl);

    return obj;
  }

  private buildRolesJson(roles: Role[]): unknown[] {
    return roles.map((role) => ({
      id: role.id.toString(),
      name: role.name,
      color: role.color?.toHex() ?? null,
      position: role.position,
    }));
  }

  private async buildEmojiJson(emoji: Emoji): Promise<unknown> {
    return {
      id: emoji.id?.toString() ?? null,
      name: emoji.name,
      code: emoji.code,
      isAnimated: emoji.isAnimated,
      imageUrl: await this.context.resolveAssetUrl(emoji.imageUrl),
    };
  }

  private async buildEmbedAuthorJson(author: EmbedAuthor): Promise<unknown> {
    const obj: Record<string, unknown> = {
      name: author.name,
      url: author.url,
    };

    if (author.iconUrl?.trim()) {
      obj.iconUrl = await this.context.resolveAssetUrl(author.iconProxyUrl ?? author.iconUrl);
      obj.iconCanonicalUrl = author.iconUrl;
    }

    return obj;
  }

  private async buildEmbedImageJson(image: EmbedImage): Promise<unknown> {
    const obj: Record<string, unknown> = {};

    if (image.url?.trim()) {
      obj.url = await this.context.resolveAssetUrl(image.proxyUrl ?? image.url);
      obj.canonicalUrl = image.url;
    }

    obj.width = image.width;
    obj.height = image.height;

    return obj;
  }

  private async buildEmbedVideoJson(video: EmbedVideo): Promise<unknown> {
    const obj: Record<string, unknown> = {};

    if (video.url?.trim()) {
      obj.url = await this.context.resolveAssetUrl(video.proxyUrl ?? video.url);
      obj.canonicalUrl = video.url;
    }

    obj.width = video.width;
    obj.height = video.height;

    return obj;
  }

  private async buildEmbedFooterJson(footer: EmbedFooter): Promise<unknown> {
    const obj: Record<string, unknown> = {
      text: footer.text,
    };

    if (footer.iconUrl?.trim()) {
      obj.iconUrl = await this.context.resolveAssetUrl(footer.iconProxyUrl ?? footer.iconUrl);
      obj.iconCanonicalUrl = footer.iconUrl;
    }

    return obj;
  }

  private async buildEmbedFieldJson(field: EmbedField): Promise<unknown> {
    return {
      name: await this.formatMarkdown(field.name),
      value: await this.formatMarkdown(field.value),
      isInline: field.isInline,
    };
  }

  private async buildEmbedJson(embed: Embed): Promise<unknown> {
    const obj: Record<string, unknown> = {
      title: await this.formatMarkdown(embed.title ?? ''),
      url: embed.url,
      timestamp: embed.timestamp
        ? this.context.normalizeDate(embed.timestamp).toISOString()
        : null,
      description: await this.formatMarkdown(embed.description ?? ''),
    };

    if (embed.color) {
      obj.color = embed.color.toHex();
    }

    if (embed.author) {
      obj.author = await this.buildEmbedAuthorJson(embed.author);
    }

    if (embed.thumbnail) {
      obj.thumbnail = await this.buildEmbedImageJson(embed.thumbnail);
    }

    if (embed.image) {
      obj.image = await this.buildEmbedImageJson(embed.image);
    }

    if (embed.video) {
      obj.video = await this.buildEmbedVideoJson(embed.video);
    }

    if (embed.footer) {
      obj.footer = await this.buildEmbedFooterJson(embed.footer);
    }

    // Images
    obj.images = await Promise.all(embed.images.map((img) => this.buildEmbedImageJson(img)));

    // Fields
    obj.fields = await Promise.all(embed.fields.map((f) => this.buildEmbedFieldJson(f)));

    // Inline emoji
    const inlineEmojis: unknown[] = [];
    if (embed.description?.trim()) {
      const emojiNodes = extractEmojis(embed.description);
      const seenNames = new Set<string>();
      for (const node of emojiNodes) {
        if (!seenNames.has(node.name)) {
          seenNames.add(node.name);
          inlineEmojis.push(
            await this.buildEmojiJson(new Emoji(node.id, node.name, node.isAnimated))
          );
        }
      }
    }
    obj.inlineEmojis = inlineEmojis;

    return obj;
  }

  async writePreamble(): Promise<void> {
    const guild = {
      id: this.context.request.guild.id.toString(),
      name: this.context.request.guild.name,
      iconUrl: await this.context.resolveAssetUrl(this.context.request.guild.iconUrl),
    };

    const channel: Record<string, unknown> = {
      id: this.context.request.channel.id.toString(),
      type: this.context.request.channel.kind.toString(),
      categoryId: this.context.request.channel.parent?.id?.toString() ?? null,
      category: this.context.request.channel.parent?.name ?? null,
      name: this.context.request.channel.name,
      topic: this.context.request.channel.topic,
    };

    if (this.context.request.channel.iconUrl?.trim()) {
      channel.iconUrl = await this.context.resolveAssetUrl(this.context.request.channel.iconUrl);
    }

    const dateRange = {
      after: this.context.request.after
        ? this.context.normalizeDate(this.context.request.after.toDate()).toISOString()
        : null,
      before: this.context.request.before
        ? this.context.normalizeDate(this.context.request.before.toDate()).toISOString()
        : null,
    };

    const exportedAt = this.context.normalizeDate(new Date()).toISOString();

    this.preambleData = { guild, channel, dateRange, exportedAt };
  }

  async writeMessage(message: Message): Promise<void> {
    await super.writeMessage(message);

    const obj: Record<string, unknown> = {
      id: message.id.toString(),
      type: message.kind.toString(),
      timestamp: this.context.normalizeDate(message.timestamp).toISOString(),
      timestampEdited: message.editedTimestamp
        ? this.context.normalizeDate(message.editedTimestamp).toISOString()
        : null,
      callEndedTimestamp: message.callEndedTimestamp
        ? this.context.normalizeDate(message.callEndedTimestamp).toISOString()
        : null,
      isPinned: message.isPinned,
    };

    // Content
    if (message.isSystemNotification) {
      obj.content = message.getFallbackContent();
    } else {
      obj.content = await this.formatMarkdown(message.content);
    }

    // Author
    obj.author = await this.buildUserJson(message.author, true);

    // Attachments
    obj.attachments = await Promise.all(
      message.attachments.map(async (att) => ({
        id: att.id.toString(),
        url: await this.context.resolveAssetUrl(att.url),
        fileName: att.fileName,
        fileSizeBytes: att.fileSize.totalBytes,
      }))
    );

    // Embeds
    obj.embeds = await Promise.all(message.embeds.map((e) => this.buildEmbedJson(e)));

    // Stickers
    obj.stickers = await Promise.all(
      message.stickers.map(async (s) => ({
        id: s.id.toString(),
        name: s.name,
        format: s.format.toString(),
        sourceUrl: await this.context.resolveAssetUrl(s.sourceUrl),
      }))
    );

    // Reactions
    obj.reactions = await Promise.all(
      message.reactions.map(async (r) => {
        const users: unknown[] = [];
        // Fetch reaction users
        for await (const user of this.context.discord.getMessageReactions(
          this.context.request.channel.id,
          message.id,
          r.emoji
        )) {
          users.push(await this.buildUserJson(user, false));
        }

        return {
          emoji: await this.buildEmojiJson(r.emoji),
          count: r.count,
          users,
        };
      })
    );

    // Mentions
    obj.mentions = await Promise.all(message.mentionedUsers.map((u) => this.buildUserJson(u, true)));

    // Message reference
    if (message.reference) {
      obj.reference = {
        messageId: message.reference.messageId?.toString() ?? null,
        channelId: message.reference.channelId?.toString() ?? null,
        guildId: message.reference.guildId?.toString() ?? null,
      };
    }

    // Interaction
    if (message.interaction) {
      obj.interaction = {
        id: message.interaction.id.toString(),
        name: message.interaction.name,
        user: await this.buildUserJson(message.interaction.user, true),
      };
    }

    // Inline emoji
    const inlineEmojis: unknown[] = [];
    const emojiNodes = extractEmojis(message.content);
    const seenNames = new Set<string>();
    for (const node of emojiNodes) {
      if (!seenNames.has(node.name)) {
        seenNames.add(node.name);
        inlineEmojis.push(
          await this.buildEmojiJson(new Emoji(node.id, node.name, node.isAnimated))
        );
      }
    }
    obj.inlineEmojis = inlineEmojis;

    this.jsonMessages.push(obj);
  }

  async writePostamble(): Promise<void> {
    const fullJson = {
      ...this.preambleData,
      messages: this.jsonMessages,
      messageCount: this.messagesWritten,
    };

    this.write(JSON.stringify(fullJson, null, 2));
  }
}
