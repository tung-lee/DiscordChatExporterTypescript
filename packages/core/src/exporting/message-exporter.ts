import * as fs from 'fs';
import * as path from 'path';
import { Message } from '../discord/data/message.js';
import { ExportContext } from './export-context.js';
import { MessageWriter } from './writers/message-writer.js';
import { MessageWriterFactory } from './writers/message-writer-factory.js';

/**
 * Handles exporting messages to files with partition support
 */
export class MessageExporter {
  private partitionIndex = 0;
  private writer: MessageWriter | null = null;
  private _messagesExported = 0;

  constructor(private readonly context: ExportContext) {}

  /**
   * Number of messages exported so far
   */
  get messagesExported(): number {
    return this._messagesExported;
  }

  /**
   * Initialize or get the current writer, handling partitioning
   */
  private async initializeWriter(): Promise<MessageWriter> {
    // Check if partition limit has been reached
    if (
      this.writer !== null &&
      this.context.request.partitionLimit.isReached(
        this.writer.messagesWritten,
        this.writer.bytesWritten
      )
    ) {
      await this.uninitializeWriter();
      this.partitionIndex++;
    }

    // Writer is still valid, return it
    if (this.writer !== null) {
      return this.writer;
    }

    // Create output directory if it doesn't exist
    const outputDir = this.context.request.outputDirPath;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get the file path for this partition
    const filePath = MessageExporter.getPartitionFilePath(
      this.context.request.outputFilePath,
      this.partitionIndex
    );

    // Create the writer
    const writer = MessageWriterFactory.create(filePath, this.context);
    await writer.writePreamble();

    return (this.writer = writer);
  }

  /**
   * Close the current writer
   */
  private async uninitializeWriter(): Promise<void> {
    if (this.writer !== null) {
      try {
        await this.writer.writePostamble();
      } finally {
        // Writer must be disposed even if postamble fails
        await this.writer.dispose();
        this.writer = null;
      }
    }
  }

  /**
   * Export a single message
   */
  async exportMessage(message: Message): Promise<void> {
    const writer = await this.initializeWriter();
    await writer.writeMessage(message);
    this._messagesExported++;
  }

  /**
   * Finalize the export and close all resources
   */
  async dispose(): Promise<void> {
    // If no messages were exported, force creation of an empty file
    if (this._messagesExported <= 0) {
      await this.initializeWriter();
    }

    await this.uninitializeWriter();
  }

  /**
   * Get the file path for a specific partition
   */
  private static getPartitionFilePath(baseFilePath: string, partitionIndex: number): string {
    // First partition, don't change the file name
    if (partitionIndex <= 0) {
      return baseFilePath;
    }

    // Inject partition index into the file name
    const dirPath = path.dirname(baseFilePath);
    const ext = path.extname(baseFilePath);
    const baseName = path.basename(baseFilePath, ext);
    const fileName = `${baseName} [part ${partitionIndex + 1}]${ext}`;

    return dirPath ? path.join(dirPath, fileName) : fileName;
  }
}
