import {
  MarkdownNode,
  TextNode,
  FormattingNode,
  HeadingNode,
  ListNode,
  ListItemNode,
  InlineCodeBlockNode,
  MultiLineCodeBlockNode,
  LinkNode,
  EmojiNode,
  MentionNode,
  TimestampNode,
} from '../nodes.js';

/**
 * Abstract visitor for markdown nodes
 * Subclass and override methods to process specific node types
 */
export abstract class MarkdownVisitor {
  protected async visitText(_node: TextNode): Promise<void> {
    // Default implementation does nothing
  }

  protected async visitFormatting(node: FormattingNode): Promise<void> {
    await this.visitAll(node.children);
  }

  protected async visitHeading(node: HeadingNode): Promise<void> {
    await this.visitAll(node.children);
  }

  protected async visitList(node: ListNode): Promise<void> {
    for (const item of node.items) {
      await this.visitListItem(item);
    }
  }

  protected async visitListItem(node: ListItemNode): Promise<void> {
    await this.visitAll(node.children);
  }

  protected async visitInlineCodeBlock(_node: InlineCodeBlockNode): Promise<void> {
    // Default implementation does nothing
  }

  protected async visitMultiLineCodeBlock(_node: MultiLineCodeBlockNode): Promise<void> {
    // Default implementation does nothing
  }

  protected async visitLink(node: LinkNode): Promise<void> {
    await this.visitAll(node.children);
  }

  protected async visitEmoji(_node: EmojiNode): Promise<void> {
    // Default implementation does nothing
  }

  protected async visitMention(_node: MentionNode): Promise<void> {
    // Default implementation does nothing
  }

  protected async visitTimestamp(_node: TimestampNode): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Visit a single node
   */
  async visit(node: MarkdownNode): Promise<void> {
    switch (node.type) {
      case 'text':
        await this.visitText(node);
        break;
      case 'formatting':
        await this.visitFormatting(node);
        break;
      case 'heading':
        await this.visitHeading(node);
        break;
      case 'list':
        await this.visitList(node);
        break;
      case 'listItem':
        await this.visitListItem(node);
        break;
      case 'inlineCodeBlock':
        await this.visitInlineCodeBlock(node);
        break;
      case 'multiLineCodeBlock':
        await this.visitMultiLineCodeBlock(node);
        break;
      case 'link':
        await this.visitLink(node);
        break;
      case 'emoji':
        await this.visitEmoji(node);
        break;
      case 'mention':
        await this.visitMention(node);
        break;
      case 'timestamp':
        await this.visitTimestamp(node);
        break;
      default:
        throw new Error(`Unknown node type: ${(node as MarkdownNode).type}`);
    }
  }

  /**
   * Visit multiple nodes
   */
  async visitAll(nodes: readonly MarkdownNode[]): Promise<void> {
    for (const node of nodes) {
      await this.visit(node);
    }
  }
}
