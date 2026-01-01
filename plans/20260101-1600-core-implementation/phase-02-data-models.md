# Phase 2: Discord Data Models

## Context
- Reference: `source_ref/DiscordChatExporter.Core/Discord/Data/`
- Dependencies: Phase 1 (Snowflake)

## Overview
| Property | Value |
|----------|-------|
| Priority | High |
| Status | Pending |
| Estimated Files | ~25 |

## Key Insights
- All models are immutable records with static parse() methods
- JSON parsing uses property access with nullish fallbacks
- Some computed properties (isDirect, isBot, isEmpty)
- EmojiIndex maps shortcodes to Unicode

## Requirements
- Type-safe parsing from Discord API JSON
- Immutable data structures
- Proper enum representations

## Implementation Steps

### 1. Implement Enums
File: `src/discord/data/enums.ts`
- [ ] ChannelKind (GuildTextChat=0, DirectTextChat=1, etc.)
- [ ] MessageKind (Default=0, RecipientAdd=1, etc.)
- [ ] MessageFlags (bitmask)
- [ ] StickerFormat (Png=1, Apng=2, Lottie=3, Gif=4)
- [ ] ApplicationFlags (bitmask)

### 2. Implement Common Types
- [ ] `src/discord/data/common/image-cdn.ts`
- [ ] `src/discord/data/common/has-id.ts` (interface)

### 3. Implement Core Models
- [ ] `user.ts` - id, isBot, discriminator, name, displayName, avatarUrl
- [ ] `guild.ts` - id, name, iconUrl + DirectMessages singleton
- [ ] `role.ts` - id, name, color, position
- [ ] `member.ts` - user, nick, roleIds, avatarUrl

### 4. Implement Channel Model
File: `src/discord/data/channel.ts`
- [ ] All properties from C# Channel record
- [ ] Computed: isDirect, isGuild, isCategory, isVoice, isThread, isEmpty
- [ ] Methods: getParents(), getHierarchicalName()
- [ ] Methods: mayHaveMessagesBefore/After()

### 5. Implement Message-Related Models
- [ ] `attachment.ts` - with isImage, isVideo, isAudio, isSpoiler
- [ ] `reaction.ts`
- [ ] `emoji.ts` - with imageUrl computation
- [ ] `sticker.ts`
- [ ] `message-reference.ts`
- [ ] `interaction.ts`
- [ ] `invite.ts`
- [ ] `channel-connection.ts`

### 6. Implement Embed Models
Directory: `src/discord/data/embeds/`
- [ ] `embed.ts` - main embed with all properties
- [ ] `embed-author.ts`
- [ ] `embed-field.ts`
- [ ] `embed-footer.ts`
- [ ] `embed-image.ts`
- [ ] `embed-video.ts`
- [ ] `embed-kind.ts` (enum)
- [ ] Projections: SpotifyTrack, TwitchClip, YouTubeVideo

### 7. Implement Message Model
File: `src/discord/data/message.ts`
- [ ] All properties
- [ ] Embed normalization (Twitter multi-image fix)
- [ ] Computed: isSystemNotification, isReply, isReplyLike, isEmpty
- [ ] Method: getReferencedUsers()
- [ ] Method: getFallbackContent() for system messages

### 8. Implement EmojiIndex
File: `src/discord/data/emoji-index.ts`
- [ ] Map shortcodes to Unicode emoji
- [ ] tryGetName() method

## Todo List
- [ ] Create enums file
- [ ] Implement ImageCdn utilities
- [ ] Implement User, Guild, Role, Member
- [ ] Implement Channel with hierarchy
- [ ] Implement Attachment, Reaction, Emoji, Sticker
- [ ] Implement all Embed types
- [ ] Implement Message with normalization
- [ ] Implement EmojiIndex
- [ ] Write parsing tests with API fixtures

## Success Criteria
- [ ] All models parse sample Discord API JSON correctly
- [ ] TypeScript inference works for all properties
- [ ] Guild.DirectMessages singleton works

## Risk Assessment
- Medium complexity due to many models
- Need accurate API fixtures for testing
