/**
 * Discord channel types
 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 */
export enum ChannelKind {
  GuildTextChat = 0,
  DirectTextChat = 1,
  GuildVoiceChat = 2,
  DirectGroupTextChat = 3,
  GuildCategory = 4,
  GuildNews = 5,
  GuildNewsThread = 10,
  GuildPublicThread = 11,
  GuildPrivateThread = 12,
  GuildStageVoice = 13,
  GuildDirectory = 14,
  GuildForum = 15,
}

/**
 * Discord message types
 * @see https://discord.com/developers/docs/resources/channel#message-object-message-types
 */
export enum MessageKind {
  Default = 0,
  RecipientAdd = 1,
  RecipientRemove = 2,
  Call = 3,
  ChannelNameChange = 4,
  ChannelIconChange = 5,
  ChannelPinnedMessage = 6,
  GuildMemberJoin = 7,
  UserPremiumGuildSubscription = 8,
  UserPremiumGuildSubscriptionTier1 = 9,
  UserPremiumGuildSubscriptionTier2 = 10,
  UserPremiumGuildSubscriptionTier3 = 11,
  ChannelFollowAdd = 12,
  GuildDiscoveryDisqualified = 14,
  GuildDiscoveryRequalified = 15,
  GuildDiscoveryGracePeriodInitialWarning = 16,
  GuildDiscoveryGracePeriodFinalWarning = 17,
  ThreadCreated = 18,
  Reply = 19,
  ChatInputCommand = 20,
  ThreadStarterMessage = 21,
  GuildInviteReminder = 22,
  ContextMenuCommand = 23,
  AutoModerationAction = 24,
  RoleSubscriptionPurchase = 25,
  InteractionPremiumUpsell = 26,
  StageStart = 27,
  StageEnd = 28,
  StageSpeaker = 29,
  StageTopic = 31,
  GuildApplicationPremiumSubscription = 32,
}

/**
 * Discord message flags (bitmask)
 * @see https://discord.com/developers/docs/resources/channel#message-object-message-flags
 */
export enum MessageFlags {
  None = 0,
  Crossposted = 1 << 0,
  IsCrosspost = 1 << 1,
  SuppressEmbeds = 1 << 2,
  SourceMessageDeleted = 1 << 3,
  Urgent = 1 << 4,
  HasThread = 1 << 5,
  Ephemeral = 1 << 6,
  Loading = 1 << 7,
  FailedToMentionSomeRolesInThread = 1 << 8,
  SuppressNotifications = 1 << 12,
  IsVoiceMessage = 1 << 13,
}

/**
 * Discord sticker format types
 * @see https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types
 */
export enum StickerFormat {
  Png = 1,
  Apng = 2,
  Lottie = 3,
  Gif = 4,
}

/**
 * Discord application flags (bitmask)
 * @see https://discord.com/developers/docs/resources/application#application-object-application-flags
 */
export enum ApplicationFlags {
  None = 0,
  ApplicationAutoModerationRuleCreateBadge = 1 << 6,
  GatewayPresence = 1 << 12,
  GatewayPresenceLimited = 1 << 13,
  GatewayGuildMembers = 1 << 14,
  GatewayGuildMembersLimited = 1 << 15,
  VerificationPendingGuildLimit = 1 << 16,
  Embedded = 1 << 17,
  GatewayMessageContent = 1 << 18,
  GatewayMessageContentLimited = 1 << 19,
  ApplicationCommandBadge = 1 << 23,
}

/**
 * Embed types
 */
export enum EmbedKind {
  Rich = 'rich',
  Image = 'image',
  Video = 'video',
  Gifv = 'gifv',
  Article = 'article',
  Link = 'link',
}
