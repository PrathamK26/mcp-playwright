# Proxy Configuration Implementation Plan

## Overview

Add proxy support using a simple JSON argument, following the headless mode pattern.

**Usage:**
```bash
--proxy '{"server": "http://premium.residential.proxyrack.net:10000"}'
```

## Proxy JSON Format

```typescript
{
  server: string;        // Required
  bypass?: string;       // Optional: "*.example.com,localhost"
  username?: string;     // Optional
  password?: string;     // Optional
}
```

## Implementation Steps

### 1. Update `src/config.ts`

Add after headless mode parsing:

```typescript
// Proxy configuration
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

export const GLOBAL_PROXY_CONFIG = cliProxyConfig || envProxyConfig;
export const CLI_PROXY_MODE = !!cliProxyConfig;
export const ENV_PROXY_MODE = !!envProxyConfig && !cliProxyConfig;
```

### 2. Update `src/index.ts`

Add after headless mode logging:

```typescript
import { GLOBAL_PROXY_CONFIG, CLI_PROXY_MODE, ENV_PROXY_MODE } from "./config.js";

if (GLOBAL_PROXY_CONFIG) {
  const source = CLI_PROXY_MODE ? '--proxy flag' : 'PLAYWRIGHT_PROXY environment variable';
  const authInfo = GLOBAL_PROXY_CONFIG.username ? ' (authenticated)' : '';
  const bypassInfo = GLOBAL_PROXY_CONFIG.bypass ? ` (bypass: ${GLOBAL_PROXY_CONFIG.bypass})` : '';
  console.error(`Playwright MCP Server starting with proxy: ${GLOBAL_PROXY_CONFIG.server}${authInfo}${bypassInfo} (${source})`);
}
```

### 3. Update `src/toolHandler.ts`

**Add import:**
```typescript
import { GLOBAL_HEADLESS_MODE, GLOBAL_PROXY_CONFIG } from './config.js';
```

**Update `BrowserSettings` interface:**
```typescript
interface BrowserSettings {
  viewport?: { width?: number; height?: number; };
  userAgent?: string;
  headless?: boolean;
  browserType?: 'chromium' | 'firefox' | 'webkit';
  proxy?: {
    server: string;
    bypass?: string;
    username?: string;
    password?: string;
  };
}
```

**Update browser launch (2 locations ~line 206 and ~280):**
```typescript
const launchOptions: any = {
  headless,
  executablePath: executablePath  // Only in first location
};

if (browserSettings?.proxy) {
  launchOptions.proxy = browserSettings.proxy;
}

browser = await browserInstance.launch(launchOptions);
```

**Update `handleToolCall()` browser settings:**
```typescript
const proxyConfig = GLOBAL_PROXY_CONFIG || args.proxy || undefined;

const browserSettings = {
  viewport: { width: args.width, height: args.height },
  userAgent: name === "playwright_custom_user_agent" ? args.userAgent : undefined,
  headless: headless,
  browserType: args.browserType || 'chromium',
  ...(proxyConfig && { proxy: proxyConfig })
};
```

### 4. Update `src/tools.ts`

Add to `playwright_navigate` tool properties:

```typescript
proxy: {
  type: "object",
  description: "Proxy configuration (global proxy takes precedence). Example: {\"server\": \"http://proxy.com:8080\"}",
  properties: {
    server: { type: "string", description: "Proxy server URL" },
    bypass: { type: "string", description: "Bypass domains (comma-separated)" },
    username: { type: "string", description: "Auth username" },
    password: { type: "string", description: "Auth password" }
  },
  required: ["server"]
}
```

## Configuration Examples

### Basic Proxy (CLI)
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@executeautomation/playwright-mcp-server",
        "--proxy",
        "{\"server\": \"http://premium.residential.proxyrack.net:10000\"}"
      ]
    }
  }
}
```

### Authenticated Proxy (Environment)
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"],
      "env": {
        "PLAYWRIGHT_PROXY": "{\"server\": \"http://proxy.com:8080\", \"username\": \"user\", \"password\": \"pass\"}"
      }
    }
  }
}
```

### With Bypass Domains
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@executeautomation/playwright-mcp-server",
        "--proxy",
        "{\"server\": \"http://proxy.com:8080\", \"bypass\": \"*.internal.com,localhost\"}"
      ]
    }
  }
}
```

## Files to Modify

1. `src/config.ts` - Add proxy parsing
2. `src/index.ts` - Add proxy logging  
3. `src/toolHandler.ts` - Add proxy to browser launch
4. `src/tools.ts` - Add proxy parameter
5. `README.md` - Add proxy documentation section
6. `docs/docs/local-setup/Installation.mdx` - Add Step 6
7. `docs/docs/playwright-web/Supported-Tools.mdx` - Update docs

## Testing Checklist

- [ ] Test CLI `--proxy` with valid JSON
- [ ] Test CLI `--proxy` with malformed JSON
- [ ] Test `PLAYWRIGHT_PROXY` env var
- [ ] Test CLI precedence over env
- [ ] Test global proxy overrides per-tool
- [ ] Test without proxy (backward compatibility)
- [ ] Verify passwords not logged
- [ ] Test with different browser types
- [ ] Test authenticated proxy
- [ ] Test bypass domains

## Summary

- Single JSON argument: `--proxy '{"server": "..."}'`
- Environment variable: `PLAYWRIGHT_PROXY`
- Matches Playwright's native format
- No complex parsing needed
- Backward compatible

**Estimated Time:** 2-3 hours
