#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createToolDefinitions } from "./tools.js";
import { setupRequestHandlers } from "./requestHandler.js";
import { GLOBAL_HEADLESS_MODE, CLI_HEADLESS_MODE, ENV_HEADLESS_MODE, GLOBAL_PROXY_CONFIG, CLI_PROXY_MODE, ENV_PROXY_MODE } from "./config.js";

// Log the configuration on startup
if (GLOBAL_HEADLESS_MODE) {
  const source = CLI_HEADLESS_MODE ? '--headless flag' : 'PLAYWRIGHT_HEADLESS environment variable';
  console.error(`Playwright MCP Server starting in headless mode (${source})`);
}

if (GLOBAL_PROXY_CONFIG) {
  const source = CLI_PROXY_MODE ? '--proxy flag' : 'PLAYWRIGHT_PROXY environment variable';
  const authInfo = GLOBAL_PROXY_CONFIG.username ? ' (authenticated)' : '';
  const bypassInfo = GLOBAL_PROXY_CONFIG.bypass ? ` (bypass: ${GLOBAL_PROXY_CONFIG.bypass})` : '';
  console.error(`Playwright MCP Server starting with proxy: ${GLOBAL_PROXY_CONFIG.server}${authInfo}${bypassInfo} (${source})`);
}

async function runServer() {
  const server = new Server(
    {
      name: "playwright-mcp",
      version: "1.0.6",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  // Create tool definitions
  const TOOLS = createToolDefinitions();

  // Setup request handlers
  setupRequestHandlers(server, TOOLS);

  // Graceful shutdown logic
  function shutdown() {
    console.log('Shutdown signal received');
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('exit', shutdown);
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  // Create transport and connect
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});