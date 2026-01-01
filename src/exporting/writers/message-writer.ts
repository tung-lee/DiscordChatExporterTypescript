import * as fs from 'fs';
import { Message } from '../../discord/data/message.js';
import { ExportContext } from '../export-context.js';

/**
 * Base class for message writers
 */
export abstract class MessageWriter {
  private _messagesWritten = 0;
  private _bytesWritten = 0;
  protected readonly stream: fs.WriteStream;

  constructor(
    filePath: string,
    protected readonly context: ExportContext
  ) {
    this.stream = fs.createWriteStream(filePath, { encoding: 'utf8' });
  }

  /**
   * Number of messages written
   */
  get messagesWritten(): number {
    return this._messagesWritten;
  }

  /**
   * Number of bytes written
   */
  get bytesWritten(): number {
    return this._bytesWritten;
  }

  /**
   * Write content to the stream
   */
  protected write(content: string): void {
    this.stream.write(content);
    this._bytesWritten += Buffer.byteLength(content, 'utf8');
  }

  /**
   * Write a line to the stream
   */
  protected writeLine(content: string = ''): void {
    this.write(content + '\n');
  }

  /**
   * Write the preamble (e.g., file header, opening tags)
   */
  async writePreamble(): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Write a message
   */
  async writeMessage(_message: Message): Promise<void> {
    this._messagesWritten++;
  }

  /**
   * Write the postamble (e.g., file footer, closing tags)
   */
  async writePostamble(): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Close the writer and flush all content
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stream.end((err: Error | null | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Dispose/cleanup resources
   */
  async dispose(): Promise<void> {
    await this.close();
  }
}
