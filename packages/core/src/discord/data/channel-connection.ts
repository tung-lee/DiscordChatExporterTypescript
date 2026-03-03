import type { Channel } from './channel.js';

/**
 * Represents a channel with its children in a tree structure
 */
export class ChannelConnection {
  readonly channel: Channel;
  readonly children: readonly ChannelConnection[];

  constructor(channel: Channel, children: readonly ChannelConnection[]) {
    this.channel = channel;
    this.children = children;
  }

  /**
   * Build a tree of channel connections from a flat list of channels
   */
  static buildTree(channels: readonly Channel[]): readonly ChannelConnection[] {
    const getChildren = (parent: Channel): readonly ChannelConnection[] =>
      channels
        .filter((c) => c.parent?.id.equals(parent.id))
        .map((c) => new ChannelConnection(c, getChildren(c)));

    return channels
      .filter((c) => c.parent === null)
      .map((c) => new ChannelConnection(c, getChildren(c)));
  }
}
