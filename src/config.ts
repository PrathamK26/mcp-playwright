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

/**
 * Proxy configuration
 * Checks both CLI flag (--proxy) and environment variable (PLAYWRIGHT_PROXY)
 * CLI flag takes precedence over environment variable
 */
const proxyArgIndex = args.findIndex(arg => arg === '--proxy');
let cliProxyConfig = null;

if (proxyArgIndex !== -1 && args[proxyArgIndex + 1]) {
  try {
    cliProxyConfig = JSON.parse(args[proxyArgIndex + 1]);
  } catch (error) {
    console.error('Failed to parse --proxy argument:', error);
  }
}

let envProxyConfig = null;
if (process.env.PLAYWRIGHT_PROXY) {
  try {
    envProxyConfig = JSON.parse(process.env.PLAYWRIGHT_PROXY);
  } catch (error) {
    console.error('Failed to parse PLAYWRIGHT_PROXY:', error);
  }
}

/**
 * Global proxy configuration
 */
export const GLOBAL_PROXY_CONFIG = cliProxyConfig || envProxyConfig;

/**
 * Check if proxy was enabled via CLI flag
 */
export const CLI_PROXY_MODE = !!cliProxyConfig;

/**
 * Check if proxy was enabled via environment variable
 */
export const ENV_PROXY_MODE = !!envProxyConfig && !cliProxyConfig;
