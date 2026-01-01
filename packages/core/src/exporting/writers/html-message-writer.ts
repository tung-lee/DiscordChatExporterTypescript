import { MessageWriter } from './message-writer.js';
import { HtmlMarkdownVisitor } from './html-markdown-visitor.js';
import { getStyles } from './html/styles.js';
import { ExportContext } from '../export-context.js';
import { ExportFormat } from '../export-format.js';
import { Message } from '../../discord/data/message.js';
import { Embed } from '../../discord/data/embeds/embed.js';

/**
 * HTML encode special characters
 */
function htmlEncode(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Message writer for HTML format
 */
export class HtmlMessageWriter extends MessageWriter {
  private readonly theme: 'dark' | 'light';
  private messageGroup: Message[] = [];

  constructor(filePath: string, context: ExportContext) {
    super(filePath, context);
    this.theme = context.request.format === ExportFormat.HtmlDark ? 'dark' : 'light';
  }

  /**
   * Check if a message can join the current group
   */
  private canJoinGroup(message: Message): boolean {
    const lastMessage = this.messageGroup[this.messageGroup.length - 1];
    if (!lastMessage) {
      return true;
    }

    // Reply-like messages cannot join existing groups
    if (message.isReplyLike) {
      return false;
    }

    // System notifications can only be grouped with other system notifications
    if (message.isSystemNotification) {
      if (!lastMessage.isSystemNotification) {
        return false;
      }
    } else {
      // Normal messages can only be grouped with other normal messages
      if (lastMessage.isSystemNotification) {
        return false;
      }

      // Messages must be within 7 minutes of each other
      const timeDiff = Math.abs(message.timestamp.getTime() - lastMessage.timestamp.getTime());
      if (timeDiff > 7 * 60 * 1000) {
        return false;
      }

      // Messages must be sent by the same author
      if (!message.author.id.equals(lastMessage.author.id)) {
        return false;
      }

      // Author must have the same display name
      if (message.author.fullName !== lastMessage.author.fullName) {
        return false;
      }
    }

    return true;
  }

  private async formatMarkdown(markdown: string): Promise<string> {
    if (this.context.request.shouldFormatMarkdown) {
      return HtmlMarkdownVisitor.format(this.context, markdown);
    }
    return htmlEncode(markdown);
  }

  async writePreamble(): Promise<void> {
    const guild = this.context.request.guild;
    const channel = this.context.request.channel;
    const iconUrl = await this.context.resolveAssetUrl(guild.iconUrl);

    this.writeLine('<!DOCTYPE html>');
    this.writeLine('<html lang="en">');
    this.writeLine('<head>');
    this.writeLine('<meta charset="utf-8">');
    this.writeLine('<meta name="viewport" content="width=device-width, initial-scale=1">');
    this.writeLine(`<title>${htmlEncode(guild.name)} - ${htmlEncode(channel.name)}</title>`);
    this.writeLine('<style>');
    this.writeLine(getStyles(this.theme));
    this.writeLine('</style>');
    this.writeLine('<script>');
    this.writeLine(`
function showSpoiler(e, el) {
  if (el.classList.contains('chatlog__markdown-spoiler--hidden')) {
    el.classList.remove('chatlog__markdown-spoiler--hidden');
  }
}

function scrollToMessage(e, id) {
  const el = document.getElementById('chatlog__message-container-' + id);
  if (el) {
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('chatlog__message--highlighted');
    setTimeout(() => el.classList.remove('chatlog__message--highlighted'), 2000);
  }
}
`);
    this.writeLine('</script>');
    this.writeLine('</head>');
    this.writeLine('<body>');

    // Preamble section
    this.writeLine('<div class="preamble">');
    this.writeLine('<div class="preamble__guild-icon-container">');
    this.writeLine(`<img class="preamble__guild-icon" src="${htmlEncode(iconUrl)}" alt="Guild Icon">`);
    this.writeLine('</div>');
    this.writeLine('<div class="preamble__entries-container">');
    this.writeLine(`<div class="preamble__entry preamble__entry--large">${htmlEncode(guild.name)}</div>`);
    this.writeLine(`<div class="preamble__entry">${htmlEncode(channel.getHierarchicalName())}</div>`);
    if (channel.topic) {
      this.writeLine(`<div class="preamble__entry">${htmlEncode(channel.topic)}</div>`);
    }
    this.writeLine(`<div class="preamble__entry">Exported ${this.messagesWritten.toLocaleString()} message(s)</div>`);
    this.writeLine('</div>');
    this.writeLine('</div>');

    this.writeLine('<div class="chatlog">');
  }

  private async writeMessageGroup(): Promise<void> {
    if (this.messageGroup.length === 0) {
      return;
    }

    const firstMessage = this.messageGroup[0]!;
    const member = this.context.tryGetMember(firstMessage.author.id);
    const avatarUrl = await this.context.resolveAssetUrl(
      member?.avatarUrl ?? firstMessage.author.avatarUrl
    );
    const displayName = member?.displayName ?? firstMessage.author.displayName;
    const color = this.context.tryGetUserColor(firstMessage.author.id);
    const colorStyle = color ? `color: rgb(${color.r}, ${color.g}, ${color.b})` : '';

    this.writeLine('<div class="chatlog__message-group">');

    // Avatar
    this.writeLine('<div class="chatlog__avatar-container">');
    this.writeLine(`<img class="chatlog__avatar" src="${htmlEncode(avatarUrl)}" alt="Avatar">`);
    this.writeLine('</div>');

    // Messages
    this.writeLine('<div class="chatlog__messages">');

    for (let i = 0; i < this.messageGroup.length; i++) {
      const message = this.messageGroup[i]!;
      const isFirst = i === 0;

      this.writeLine(`<div class="chatlog__message" id="chatlog__message-container-${message.id}">`);

      // Reply
      if (message.isReplyLike && message.referencedMessage) {
        const refMessage = message.referencedMessage;
        const refMember = this.context.tryGetMember(refMessage.author.id);
        const refAvatarUrl = await this.context.resolveAssetUrl(
          refMember?.avatarUrl ?? refMessage.author.avatarUrl
        );
        const refDisplayName = refMember?.displayName ?? refMessage.author.displayName;
        const refContent = refMessage.content.substring(0, 100) + (refMessage.content.length > 100 ? '...' : '');

        this.writeLine('<div class="chatlog__reply">');
        this.writeLine(`<img class="chatlog__reply-avatar" src="${htmlEncode(refAvatarUrl)}" alt="">`);
        this.writeLine(`<span class="chatlog__reply-author">${htmlEncode(refDisplayName)}</span>`);
        this.writeLine(`<span class="chatlog__reply-content">${await this.formatMarkdown(refContent)}</span>`);
        this.writeLine('</div>');
      }

      // Header (only for first message in group)
      if (isFirst) {
        this.writeLine('<div class="chatlog__header">');
        this.writeLine(`<span class="chatlog__author" style="${colorStyle}">${htmlEncode(displayName)}</span>`);
        this.writeLine(`<span class="chatlog__timestamp">${htmlEncode(this.context.formatDate(message.timestamp))}</span>`);
        if (message.isPinned) {
          this.writeLine('<span class="chatlog__pinned">PINNED</span>');
        }
        this.writeLine('</div>');
      }

      // Content
      this.writeLine(`<div class="chatlog__content ${message.isSystemNotification ? 'chatlog__message--system' : ''}">`);
      if (message.isSystemNotification) {
        this.writeLine(htmlEncode(message.getFallbackContent()));
      } else {
        this.writeLine(await this.formatMarkdown(message.content));
      }
      if (message.editedTimestamp) {
        this.writeLine(`<span class="chatlog__edited">(edited)</span>`);
      }
      this.writeLine('</div>');

      // Attachments
      for (const attachment of message.attachments) {
        const url = await this.context.resolveAssetUrl(attachment.url);
        const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(attachment.fileName);
        const isVideo = /\.(mp4|mov|avi|webm)$/i.test(attachment.fileName);

        if (isImage) {
          this.writeLine('<div class="chatlog__attachment chatlog__attachment--image">');
          this.writeLine(`<img src="${htmlEncode(url)}" alt="${htmlEncode(attachment.fileName)}">`);
          this.writeLine('</div>');
        } else if (isVideo) {
          this.writeLine('<div class="chatlog__attachment chatlog__attachment--video">');
          this.writeLine(`<video controls src="${htmlEncode(url)}"></video>`);
          this.writeLine('</div>');
        } else {
          this.writeLine('<div class="chatlog__attachment">');
          this.writeLine(`<a href="${htmlEncode(url)}">${htmlEncode(attachment.fileName)}</a>`);
          this.writeLine(` (${attachment.fileSize.format()})`);
          this.writeLine('</div>');
        }
      }

      // Embeds
      for (const embed of message.embeds) {
        await this.writeEmbed(embed);
      }

      // Stickers
      for (const sticker of message.stickers) {
        const stickerUrl = await this.context.resolveAssetUrl(sticker.sourceUrl);
        this.writeLine('<div class="chatlog__sticker">');
        this.writeLine(`<img src="${htmlEncode(stickerUrl)}" alt="${htmlEncode(sticker.name)}" title="${htmlEncode(sticker.name)}">`);
        this.writeLine('</div>');
      }

      // Reactions
      if (message.reactions.length > 0) {
        this.writeLine('<div class="chatlog__reactions">');
        for (const reaction of message.reactions) {
          const emojiUrl = await this.context.resolveAssetUrl(reaction.emoji.imageUrl);
          this.writeLine('<div class="chatlog__reaction">');
          this.writeLine(`<img class="chatlog__reaction-emoji" src="${htmlEncode(emojiUrl)}" alt="${reaction.emoji.name}">`);
          this.writeLine(`<span class="chatlog__reaction-count">${reaction.count}</span>`);
          this.writeLine('</div>');
        }
        this.writeLine('</div>');
      }

      this.writeLine('</div>');
    }

    this.writeLine('</div>');
    this.writeLine('</div>');

    this.messageGroup = [];
  }

  private async writeEmbed(embed: Embed): Promise<void> {
    const borderColor = embed.color ? `border-left-color: ${embed.color.toHex()}` : '';

    this.writeLine(`<div class="chatlog__embed" style="${borderColor}">`);
    this.writeLine('<div class="chatlog__embed-content">');

    // Author
    if (embed.author?.name) {
      const authorIconUrl = embed.author.iconUrl
        ? await this.context.resolveAssetUrl(embed.author.iconProxyUrl ?? embed.author.iconUrl)
        : '';

      this.writeLine('<div class="chatlog__embed-author">');
      if (authorIconUrl) {
        this.writeLine(`<img class="chatlog__embed-author-icon" src="${htmlEncode(authorIconUrl)}" alt="">`);
      }
      if (embed.author.url) {
        this.writeLine(`<a class="chatlog__embed-author-name" href="${htmlEncode(embed.author.url)}">${htmlEncode(embed.author.name)}</a>`);
      } else {
        this.writeLine(`<span class="chatlog__embed-author-name">${htmlEncode(embed.author.name)}</span>`);
      }
      this.writeLine('</div>');
    }

    // Title
    if (embed.title) {
      if (embed.url) {
        this.writeLine(`<div class="chatlog__embed-title"><a href="${htmlEncode(embed.url)}">${await this.formatMarkdown(embed.title)}</a></div>`);
      } else {
        this.writeLine(`<div class="chatlog__embed-title">${await this.formatMarkdown(embed.title)}</div>`);
      }
    }

    // Description
    if (embed.description) {
      this.writeLine(`<div class="chatlog__embed-description">${await this.formatMarkdown(embed.description)}</div>`);
    }

    // Fields
    if (embed.fields.length > 0) {
      this.writeLine('<div class="chatlog__embed-fields">');
      for (const field of embed.fields) {
        const inlineClass = field.isInline ? 'chatlog__embed-field--inline' : '';
        this.writeLine(`<div class="chatlog__embed-field ${inlineClass}">`);
        this.writeLine(`<div class="chatlog__embed-field-name">${await this.formatMarkdown(field.name)}</div>`);
        this.writeLine(`<div class="chatlog__embed-field-value">${await this.formatMarkdown(field.value)}</div>`);
        this.writeLine('</div>');
      }
      this.writeLine('</div>');
    }

    // Images
    if (embed.images.length > 0) {
      this.writeLine('<div class="chatlog__embed-images">');
      for (const image of embed.images) {
        const url = image.proxyUrl ?? image.url;
        if (url) {
          const imageUrl = await this.context.resolveAssetUrl(url);
          this.writeLine(`<img src="${htmlEncode(imageUrl)}" alt="">`);
        }
      }
      this.writeLine('</div>');
    }

    // Footer
    if (embed.footer?.text) {
      const footerIconUrl = embed.footer.iconUrl
        ? await this.context.resolveAssetUrl(embed.footer.iconProxyUrl ?? embed.footer.iconUrl)
        : '';

      this.writeLine('<div class="chatlog__embed-footer">');
      if (footerIconUrl) {
        this.writeLine(`<img class="chatlog__embed-footer-icon" src="${htmlEncode(footerIconUrl)}" alt="">`);
      }
      this.writeLine(`<span>${htmlEncode(embed.footer.text)}</span>`);
      this.writeLine('</div>');
    }

    this.writeLine('</div>');

    // Thumbnail
    if (embed.thumbnail?.url) {
      const thumbnailUrl = await this.context.resolveAssetUrl(
        embed.thumbnail.proxyUrl ?? embed.thumbnail.url
      );
      this.writeLine(`<img class="chatlog__embed-thumbnail" src="${htmlEncode(thumbnailUrl)}" alt="">`);
    }

    this.writeLine('</div>');
  }

  async writeMessage(message: Message): Promise<void> {
    await super.writeMessage(message);

    if (!this.canJoinGroup(message)) {
      await this.writeMessageGroup();
    }

    this.messageGroup.push(message);
  }

  async writePostamble(): Promise<void> {
    // Write the last message group
    await this.writeMessageGroup();

    this.writeLine('</div>'); // Close chatlog

    // Postamble
    this.writeLine('<div class="postamble">');
    this.writeLine(`Exported ${this.messagesWritten.toLocaleString()} message(s)`);
    this.writeLine('</div>');

    this.writeLine('</body>');
    this.writeLine('</html>');
  }
}
