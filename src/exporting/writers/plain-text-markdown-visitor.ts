import { MarkdownVisitor } from '../../markdown/parsing/markdown-visitor.js';
import { parseMinimal } from '../../markdown/parsing/markdown-parser.js';
import {
  TextNode,
  EmojiNode,
  MentionNode,
  TimestampNode,
} from '../../markdown/nodes.js';
import { MentionKind } from '../../markdown/mention-kind.js';
import { ExportContext } from '../export-context.js';

/**
 * Markdown visitor that formats to plain text
 */
export class PlainTextMarkdownVisitor extends MarkdownVisitor {
  private buffer = '';

  constructor(private readonly context: ExportContext) {
    super();
  }

  protected async visitText(node: TextNode): Promise<void> {
    this.buffer += node.text;
  }

  protected async visitEmoji(node: EmojiNode): Promise<void> {
    this.buffer += node.isCustomEmoji ? `:${node.name}:` : node.name;
  }

  protected async visitMention(node: MentionNode): Promise<void> {
    switch (node.kind) {
      case MentionKind.Everyone:
        this.buffer += '@everyone';
        break;

      case MentionKind.Here:
        this.buffer += '@here';
        break;

      case MentionKind.User:
        if (node.targetId) {
          await this.context.populateMember(node.targetId);
          const member = this.context.tryGetMember(node.targetId);
          const displayName = member?.displayName ?? member?.user.displayName ?? 'Unknown';
          this.buffer += `@${displayName}`;
        } else {
          this.buffer += '@Unknown';
        }
        break;

      case MentionKind.Channel:
        if (node.targetId) {
          const channel = this.context.tryGetChannel(node.targetId);
          const name = channel?.name ?? 'deleted-channel';
          this.buffer += `#${name}`;
          if (channel?.isVoice) {
            this.buffer += ' [voice]';
          }
        } else {
          this.buffer += '#deleted-channel';
        }
        break;

      case MentionKind.Role:
        if (node.targetId) {
          const role = this.context.tryGetRole(node.targetId);
          const name = role?.name ?? 'deleted-role';
          this.buffer += `@${name}`;
        } else {
          this.buffer += '@deleted-role';
        }
        break;
    }
  }

  protected async visitTimestamp(node: TimestampNode): Promise<void> {
    if (node.instant) {
      this.buffer += this.context.formatDate(node.instant, node.format ?? 'g');
    } else {
      this.buffer += 'Invalid date';
    }
  }

  /**
   * Get the formatted result
   */
  getResult(): string {
    return this.buffer;
  }

  /**
   * Format markdown to plain text
   */
  static async format(context: ExportContext, markdown: string): Promise<string> {
    const nodes = parseMinimal(markdown);
    const visitor = new PlainTextMarkdownVisitor(context);
    await visitor.visitAll(nodes);
    return visitor.getResult();
  }
}
