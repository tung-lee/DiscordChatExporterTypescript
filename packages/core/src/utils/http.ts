import { Agent, RetryAgent, request, type Dispatcher } from 'undici';
import { delay } from './extensions.js';

/**
 * HTTP status codes that are retryable
 */
const RETRYABLE_STATUS_CODES = new Set([
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

/**
 * Check if an HTTP status code is retryable
 */
export function isRetryableStatusCode(statusCode: number): boolean {
  return RETRYABLE_STATUS_CODES.has(statusCode) || statusCode >= 500;
}

/**
 * Create the default HTTP agent with retry support
 */
export function createHttpAgent(): Dispatcher {
  const baseAgent = new Agent({
    keepAliveTimeout: 30000,
    keepAliveMaxTimeout: 600000,
    connections: 100,
    connect: {
      timeout: 10000,
    },
  });

  return new RetryAgent(baseAgent, {
    maxRetries: 4,
    minTimeout: 1000,
    maxTimeout: 30000,
    timeoutFactor: 2,
    retryAfter: true,
  });
}

/**
 * Default HTTP agent instance
 */
export const httpAgent = createHttpAgent();

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 8,
  initialDelayMs: 1000,
  maxDelayMs: 60000,
};

/**
 * Execute a request with retry logic for rate limiting
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, initialDelayMs, maxDelayMs } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      if (attempt >= maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        initialDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelayMs
      );

      await delay(delayMs);
    }
  }

  throw lastError;
}

export { request };
