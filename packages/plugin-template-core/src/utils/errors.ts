/**
 * Error handling utilities for Plugin Template
 *
 * Uses `defineError()` from @kb-labs/shared-command-kit for streamlined error handling.
 *
 * @example Basic usage
 * ```typescript
 * import { TemplateError, ValidationError, NotFoundError } from './utils/errors';
 *
 * // Template-specific errors
 * throw new TemplateError.BusinessRuleViolation('Insufficient funds');
 * throw new TemplateError.QuotaExceeded('api_requests');
 *
 * // Common errors (imported from shared-command-kit)
 * throw new ValidationError('Email must be valid', { field: 'email' });
 * throw new NotFoundError('User not found', { userId });
 * ```
 */

import { defineError, PluginError, commonErrors } from '@kb-labs/shared-command-kit';

/**
 * Template-specific error definitions
 *
 * Define errors specific to this plugin using the error factory.
 * Each error has a code (HTTP status) and message template.
 */
export const TemplateError = defineError('TEMPLATE', {
  /**
   * Business rule violation error
   * @example throw new TemplateError.BusinessRuleViolation('Insufficient funds');
   */
  BusinessRuleViolation: {
    code: 400,
    message: (rule: string) => `Business rule violated: ${rule}`,
  },

  /**
   * Quota exceeded error
   * @example throw new TemplateError.QuotaExceeded('api_requests');
   */
  QuotaExceeded: {
    code: 429,
    message: (resource: string) => `Quota exceeded for ${resource}`,
  },

  /**
   * Configuration error
   * @example throw new TemplateError.MissingConfig('apiKey');
   */
  MissingConfig: {
    code: 500,
    message: (key: string) => `Missing configuration: ${key}`,
  },
});

/**
 * Common errors using defineError with commonErrors patterns
 *
 * These cover standard error scenarios:
 * - ValidationFailed: Input validation failures
 * - NotFound: Resource not found
 * - Unauthorized: Authentication required
 * - Forbidden: Insufficient permissions
 * - Timeout: Operation timeout
 * - NetworkError: Network/API failures
 */
export const CommonError = defineError('COMMON', commonErrors);

/**
 * Export base PluginError for custom extensions
 *
 * Use this if you need to create custom error classes that don't fit
 * the standard patterns.
 */
export { PluginError };

/**
 * Error formatter for logging
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   ctx.logger.error('Operation failed', formatErrorForLogging(error));
 * }
 * ```
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  if (error instanceof PluginError) {
    return {
      name: error.name,
      code: error.errorCode,
      statusCode: error.statusCode,
      message: error.message,
      details: error.details,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    error: String(error),
  };
}

/**
 * Error formatter for user-facing messages
 * Removes sensitive information and stack traces
 *
 * @example
 * ```typescript
 * try {
 *   await operation();
 * } catch (error) {
 *   const userMessage = formatErrorForUser(error);
 *   ctx.output?.write(`Error: ${userMessage}\n`);
 * }
 * ```
 */
export function formatErrorForUser(error: unknown): string {
  if (error instanceof PluginError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Wraps async function with error handling
 *
 * @example
 * ```typescript
 * const safeOperation = wrapWithErrorHandling(
 *   async () => riskyOperation(),
 *   error => ctx.logger.error('Operation failed', formatErrorForLogging(error))
 * );
 *
 * const result = await safeOperation();
 * ```
 */
export function wrapWithErrorHandling<T>(
  fn: () => Promise<T>,
  onError: (error: unknown) => void
): () => Promise<T | undefined> {
  return async () => {
    try {
      return await fn();
    } catch (error) {
      onError(error);
      return undefined;
    }
  };
}

/**
 * Assert function that throws ValidationError
 *
 * @example
 * ```typescript
 * function processUser(user: User | null) {
 *   assertNotNull(user, 'user', 'User is required');
 *   // TypeScript knows user is not null here
 *   console.log(user.name);
 * }
 * ```
 */
export function assertNotNull<T>(
  value: T | null | undefined,
  field: string,
  message?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new CommonError.ValidationFailed(
      message || `${field} is required`
    );
  }
}

/**
 * Assert function that throws BusinessRuleError (TemplateError)
 *
 * @example
 * ```typescript
 * function withdraw(account: Account, amount: number) {
 *   assertBusinessRule(
 *     account.balance >= amount,
 *     'Insufficient funds'
 *   );
 *   // Proceed with withdrawal
 * }
 * ```
 */
export function assertBusinessRule(
  condition: boolean,
  message: string
): asserts condition {
  if (!condition) {
    throw new TemplateError.BusinessRuleViolation(message);
  }
}
