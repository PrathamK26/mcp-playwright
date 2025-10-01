import type { CallToolResult, TextContent, ImageContent } from '@modelcontextprotocol/sdk/types.js';
import type { Page, Browser, APIRequestContext } from 'playwright';

// Context for tool execution
export interface ToolContext {
  page?: Page;
  browser?: Browser;
  apiContext?: APIRequestContext;
  server?: any;
}

// Standard response format for all tools
export interface ToolResponse extends CallToolResult {
  content: (TextContent | ImageContent)[];
  isError: boolean;
}

// Interface that all tool implementations must follow
export interface ToolHandler {
  execute(args: any, context: ToolContext): Promise<ToolResponse>;
}

// Maximum character limit for responses - THIS IS AN ABSOLUTE HARD LIMIT
export const MAX_RESPONSE_LENGTH = 20000;

/**
 * Truncates text to the maximum response length
 * @param text The text to truncate
 * @param maxLength Maximum length (defaults to MAX_RESPONSE_LENGTH, but will never exceed it)
 * @returns Truncated text with indicator if truncated
 */
export function truncateText(text: string, maxLength: number = MAX_RESPONSE_LENGTH): string {
  // Enforce absolute maximum - user can request lower, but never higher
  const effectiveMaxLength = Math.min(maxLength, MAX_RESPONSE_LENGTH);
  
  if (text.length <= effectiveMaxLength) {
    return text;
  }
  return text.slice(0, effectiveMaxLength) + '\n[Output truncated due to size limits - exceeded 20000 characters]';
}

// Helper functions for creating responses
export function createErrorResponse(message: string): ToolResponse {
  return {
    content: [{
      type: "text",
      text: truncateText(message)
    }],
    isError: true
  };
}

export function createSuccessResponse(message: string | string[]): ToolResponse {
  const messages = Array.isArray(message) ? message : [message];
  const combinedText = messages.join('\n');
  return {
    content: [{
      type: "text",
      text: truncateText(combinedText)
    }],
    isError: false
  };
} 