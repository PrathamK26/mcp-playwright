/**
 * Global configuration for the Playwright MCP Server
 * This module handles configuration from CLI arguments and environment variables
 */

// Parse command-line arguments
const args = process.argv.slice(2);

/**
 * Global headless mode configuration
 * Checks both CLI flag (--headless) and environment variable (PLAYWRIGHT_HEADLESS)
 * CLI flag takes precedence over environment variable
 */
export const GLOBAL_HEADLESS_MODE = args.includes('--headless') || process.env.PLAYWRIGHT_HEADLESS === 'true';

/**
 * Check if headless mode was enabled via CLI flag
 */
export const CLI_HEADLESS_MODE = args.includes('--headless');

/**
 * Check if headless mode was enabled via environment variable
 */
export const ENV_HEADLESS_MODE = process.env.PLAYWRIGHT_HEADLESS === 'true';
