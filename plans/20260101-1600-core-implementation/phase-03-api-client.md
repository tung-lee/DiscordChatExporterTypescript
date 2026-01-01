# Phase 3: Discord API Client

## Context
- Reference: `source_ref/DiscordChatExporter.Core/Discord/DiscordClient.cs`
- Dependencies: Phase 1, Phase 2

## Overview
| Property | Value |
|----------|-------|
| Priority | High |
| Status | Pending |
| Estimated Files | ~5 |

## Key Insights
- Auto-detects token type (User vs Bot)
- Respects rate limit headers proactively
- Uses exponential backoff for retries
- Paginated endpoints use AsyncGenerator pattern

## Requirements
- undici for HTTP client
- Rate limit header handling
- Retry on transient failures
- Progress reporting for long operations

## Implementation Steps

### 1. Implement HTTP Utilities
File: `src/utils/http.ts`
- [ ] Create undici Agent with retry
- [ ] Exponential backoff: Math.pow(2, attempt)
- [ ] Retryable status codes: 429, 408, 5xx
- [ ] Handle Retry-After header

### 2. Implement UrlBuilder
File: `src/utils/url.ts`
- [ ] setPath(), setQueryParameter()
- [ ] build() -> string

### 3. Implement RateLimitPreference
File: `src/discord/rate-limit-preference.ts`
- [ ] RespectAll, IgnoreAdvisory, IgnoreAll

### 4. Implement DiscordClient
File: `src/discord/discord-client.ts`

Constructor:
- [ ] token: string
- [ ] rateLimitPreference: RateLimitPreference

Private methods:
- [ ] getResponse(url, tokenKind) - with auth header
- [ ] resolveTokenKind() - auto-detect User vs Bot
- [ ] getJsonResponse(url) - with error handling
- [ ] tryGetJsonResponse(url) - returns null on 403/404
- [ ] handleRateLimitHeaders(response) - proactive delay

### 5. Implement API Methods
File: `src/discord/discord-client.ts`

```typescript
// Single item fetches
getApplication(): Promise<Application>
tryGetUser(userId: Snowflake): Promise<User | null>
getGuild(guildId: Snowflake): Promise<Guild>
getChannel(channelId: Snowflake): Promise<Channel>
tryGetGuildMember(guildId, memberId): Promise<Member | null>
tryGetInvite(code: string): Promise<Invite | null>

// Paginated (AsyncGenerator)
getUserGuilds(): AsyncGenerator<Guild>
getGuildChannels(guildId): AsyncGenerator<Channel>
getGuildThreads(guildId, includeArchived, before, after): AsyncGenerator<Channel>
getGuildRoles(guildId): AsyncGenerator<Role>
getMessages(channelId, after, before, progress): AsyncGenerator<Message>
getMessageReactions(channelId, messageId, emoji): AsyncGenerator<User>
getChannelThreads(channels, includeArchived, before, after): AsyncGenerator<Channel>
```

### 6. Implement Progress Reporting
- [ ] IProgress interface or callback
- [ ] Calculate progress based on timestamp range
- [ ] Report as percentage (0-100)

## Todo List
- [ ] Create HTTP utilities with undici
- [ ] Implement UrlBuilder
- [ ] Implement RateLimitPreference enum
- [ ] Implement DiscordClient core
- [ ] Implement token resolution
- [ ] Implement rate limit handling
- [ ] Implement all API methods
- [ ] Implement progress reporting
- [ ] Write integration tests with mocked responses

## Success Criteria
- [ ] Token type auto-detection works
- [ ] Rate limiting prevents 429 errors
- [ ] AsyncGenerators paginate correctly
- [ ] Progress reports accurate percentages

## Risk Assessment
- High complexity due to rate limiting nuances
- Need to handle edge cases (deleted channels, left guilds)
