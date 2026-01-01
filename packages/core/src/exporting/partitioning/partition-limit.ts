import { FileSize } from '../../utils/file-size.js';

/**
 * Base class for partition limits
 */
export abstract class PartitionLimit {
  /**
   * Check if this is a null (no limit) partition
   */
  abstract get isNull(): boolean;

  /**
   * Check if the partition limit has been reached
   */
  abstract isReached(messagesWritten: number, bytesWritten: number): boolean;

  /**
   * Parse a partition limit from string
   * Supports formats like "10mb", "500kb", "1000" (message count)
   */
  static parse(value: string | null | undefined): PartitionLimit {
    if (!value || value.trim() === '') {
      return NullPartitionLimit.Instance;
    }

    const trimmed = value.trim().toLowerCase();

    // Try to parse as file size (e.g., "10mb", "500kb")
    const fileSize = FileSize.tryParse(trimmed);
    if (fileSize !== null) {
      return new FileSizePartitionLimit(fileSize);
    }

    // Try to parse as message count
    const messageCount = parseInt(trimmed, 10);
    if (!isNaN(messageCount) && messageCount > 0) {
      return new MessageCountPartitionLimit(messageCount);
    }

    throw new Error(
      `Invalid partition limit: '${value}'. ` +
        `Expected a file size (e.g., '10mb', '500kb') or a message count (e.g., '1000').`
    );
  }
}

/**
 * Null partition limit (no partitioning)
 */
export class NullPartitionLimit extends PartitionLimit {
  static readonly Instance = new NullPartitionLimit();

  private constructor() {
    super();
  }

  get isNull(): boolean {
    return true;
  }

  isReached(_messagesWritten: number, _bytesWritten: number): boolean {
    return false; // No limit, never reached
  }
}

/**
 * Partition by file size
 */
export class FileSizePartitionLimit extends PartitionLimit {
  constructor(readonly limit: FileSize) {
    super();
  }

  get isNull(): boolean {
    return false;
  }

  isReached(_messagesWritten: number, bytesWritten: number): boolean {
    return bytesWritten >= this.limit.totalBytes;
  }
}

/**
 * Partition by message count
 */
export class MessageCountPartitionLimit extends PartitionLimit {
  constructor(readonly limit: number) {
    super();
  }

  get isNull(): boolean {
    return false;
  }

  isReached(messagesWritten: number, _bytesWritten: number): boolean {
    return messagesWritten >= this.limit;
  }
}
