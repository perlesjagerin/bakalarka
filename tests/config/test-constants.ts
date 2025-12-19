/**
 * E2E Test Configuration Constants
 * Centralized timeouts and delays for Playwright tests
 */

export const TEST_TIMEOUTS = {
  /**  Short delay for DOM updates (1 second) */
  SHORT: 1000,
  
  /** Medium delay for navigation/async operations (2 seconds) */
  MEDIUM: 2000,
  
  /** Long delay for complex operations (3 seconds) */
  LONG: 3000,
  
  /** Visibility check timeout (5 seconds) */
  VISIBILITY: 5000,
  
  /** Global test timeout (60 seconds) */
  GLOBAL: 60000,
} as const;

export const TEST_CONFIG = {
  /** Number of workers for parallel test execution */
  WORKERS: 1,
  
  /** Default timeout for all tests */
  DEFAULT_TIMEOUT: TEST_TIMEOUTS.GLOBAL,
  
  /** Browser to use for testing */
  BROWSER: 'chromium' as const,
} as const;
