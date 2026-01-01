/**
 * Utility functions and extensions
 */

/**
 * Pipe a value through a transformation function
 */
export function pipe<T, R>(value: T, fn: (v: T) => R): R {
  return fn(value);
}

/**
 * Return null if the value is the default for its type
 */
export function nullIfDefault<T>(value: T, defaultValue: T): T | null {
  return value === defaultValue ? null : value;
}

/**
 * Return null if the string is empty or whitespace
 */
export function nullIfWhitespace(value: string | null | undefined): string | null {
  if (!value || !value.trim()) {
    return null;
  }
  return value;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Get values that are not null or undefined
 */
export function filterNotNull<T>(items: (T | null | undefined)[]): T[] {
  return items.filter((item): item is T => item !== null && item !== undefined);
}

/**
 * Get distinct values from an array
 */
export function distinct<T>(items: T[]): T[] {
  return [...new Set(items)];
}

/**
 * Get distinct values by a key
 */
export function distinctBy<T, K>(items: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Convert a camelCase or PascalCase string to space-separated words
 */
export function toSpaceSeparatedWords(value: string): string {
  return value.replace(/([A-Z])/g, ' $1').trim();
}

/**
 * Escape a file name by replacing invalid characters
 */
export function escapeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_');
}

/**
 * Get self and all nested cause exceptions
 */
export function getExceptionChain(error: Error): Error[] {
  const chain: Error[] = [error];
  let current = error;
  while (current.cause instanceof Error) {
    chain.push(current.cause);
    current = current.cause;
  }
  return chain;
}

/**
 * Delay for a specified number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Try to get a value from an object, returning undefined if not present
 */
export function tryGet<T>(
  obj: Record<string, unknown>,
  key: string
): T | undefined {
  return obj[key] as T | undefined;
}
