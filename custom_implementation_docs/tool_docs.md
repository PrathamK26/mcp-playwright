# MCP Playwright Tools Documentation

## Overview
This document describes the tool configuration optimized for web scraping use cases. The MCP Playwright server has been configured to expose only the tools necessary for navigation, content extraction, and basic interactions needed to bypass common web gates.

---

## Use Case: Web Scraping with Interaction Support

### Goal
Navigate to web pages, extract HTML/text content for parsing, and perform basic interactions to bypass:
- Cookie consent banners
- Age verification gates
- Regional selection modals
- Login/paywall gates
- Popups and overlays
- Dynamic content loading

---

## Active Tools (25 total)

### 1. Navigation & Content Extraction (4 tools)
Essential tools for navigating to pages and extracting content for scraping.

| Tool | Description | Use Case |
|------|-------------|----------|
| `playwright_navigate` | Navigate to URLs with browser options | Initial page load, support for chromium/firefox/webkit |
| `playwright_get_visible_text` | Extract visible text content | Quick text extraction without HTML parsing |
| `playwright_get_visible_html` | Extract HTML with cleaning options | Primary scraping tool - get HTML for parsing |
| `playwright_close` | Close browser and cleanup | Release resources after scraping |

### 2. Basic Interactions (5 tools)
Tools needed to interact with page elements and bypass gates/modals.

| Tool | Description | Use Case |
|------|-------------|----------|
| `playwright_click` | Click elements using CSS selectors | Click "Accept Cookies", close modals, navigate links |
| `playwright_fill` | Fill input fields | Fill search boxes, login forms if needed |
| `playwright_select` | Select dropdown options | Choose regions, languages, filters |
| `playwright_hover` | Hover over elements | Trigger dropdown menus, lazy-loaded content |
| `playwright_press_key` | Press keyboard keys | Press Enter, Escape to close modals, navigate |

### 3. iFrame Interactions (2 tools)
Handle content embedded in iframes.

| Tool | Description | Use Case |
|------|-------------|----------|
| `playwright_iframe_click` | Click inside iframes | Interact with embedded content/ads |
| `playwright_iframe_fill` | Fill inputs inside iframes | Handle iframe-based forms |

### 4. JavaScript & Console (2 tools)
Execute custom logic and monitor page behavior.

| Tool | Description | Use Case |
|------|-------------|----------|
| `playwright_evaluate` | Execute JavaScript in browser | Remove overlays, extract dynamic content, custom logic |
| `playwright_console_logs` | Retrieve console logs with filters | Debug page behavior, monitor errors |

### 5. Response Handling (2 tools)
Wait for and validate API responses during scraping.

| Tool | Description | Use Case |
|------|-------------|----------|
| `playwright_expect_response` | Wait for HTTP responses | Wait for AJAX calls, API requests to complete |
| `playwright_assert_response` | Validate response content | Verify API responses, check data loading |

### 6. Output & Debugging (1 tool)
Capture page state for debugging and documentation.

| Tool | Description | Use Case |
|------|-------------|----------|
| `playwright_screenshot` | Take screenshots (full page or element) | Debug scraper, verify page state |

### 7. Advanced Features (2 tools)
Additional capabilities for robust scraping.

| Tool | Description | Use Case |
|------|-------------|----------|
| `playwright_custom_user_agent` | Set custom user agent | Avoid bot detection, mobile/desktop switching |
| `playwright_click_and_switch_tab` | Click link and switch to new tab | Handle multi-tab workflows |

---

## Disabled Tools (14 total)

### ❌ Codegen Tools (4 tools)
**Reason for disabling:** These tools are for generating Playwright test code, not needed for scraping.

- `start_codegen_session` - Start recording actions
- `end_codegen_session` - Generate test file
- `get_codegen_session` - Get session info
- `clear_codegen_session` - Clear session

**Impact:** No test code generation capability. Use native Playwright codegen if needed.

---

### ❌ API Tools (5 tools)
**Reason for disabling:** For scraping, use native HTTP clients (axios, fetch) instead of browser-based API calls.

- `playwright_get` - HTTP GET requests
- `playwright_post` - HTTP POST requests
- `playwright_put` - HTTP PUT requests
- `playwright_patch` - HTTP PATCH requests
- `playwright_delete` - HTTP DELETE requests

**Impact:** Cannot make direct HTTP requests through Playwright. Use dedicated HTTP libraries for better performance.

**Alternative:**
```javascript
// Instead of playwright_post, use:
import axios from 'axios';
await axios.post(url, data);
```

---

### ❌ Navigation History Tools (2 tools)
**Reason for disabling:** Scraping typically involves forward navigation only, not browsing history.

- `playwright_go_back` - Navigate back in history
- `playwright_go_forward` - Navigate forward in history

**Impact:** Cannot navigate browser history. If needed for multi-page scraping, re-enable these tools.

---

### ❌ Upload & Drag Tools (2 tools)
**Reason for disabling:** Not typically needed for content scraping scenarios.

- `playwright_upload_file` - Upload files to input elements
- `playwright_drag` - Drag and drop elements

**Impact:** Cannot upload files or perform drag-and-drop. Re-enable if scraping requires file uploads or drag interactions.

---

## Configuration Changes

### File: `src/tools.ts`

1. **Commented out tool definitions** - All disabled tools are wrapped in comments with clear labels:
   ```typescript
   // Codegen tools - DISABLED FOR SCRAPING
   // { name: "start_codegen_session", ... }
   ```

2. **Updated BROWSER_TOOLS array** - Removed disabled tools from the list:
   ```typescript
   export const BROWSER_TOOLS = [
     "playwright_navigate",
     // ... active tools only
     // "playwright_upload_file", // DISABLED FOR SCRAPING
   ];
   ```

3. **Emptied API_TOOLS and CODEGEN_TOOLS arrays**:
   ```typescript
   export const API_TOOLS: string[] = []; // Empty for scraping
   export const CODEGEN_TOOLS: string[] = []; // Empty for scraping
   ```

---

## How to Re-enable Disabled Tools

If you need any disabled tools for your use case:

1. **Open `src/tools.ts`**
2. **Find the commented tool definition** (search for the tool name)
3. **Uncomment the tool object** in `createToolDefinitions()` array
4. **Add the tool name to the appropriate array**:
   - Add to `BROWSER_TOOLS` for browser-based tools
   - Uncomment and add to `API_TOOLS` for API tools
   - Uncomment and add to `CODEGEN_TOOLS` for codegen tools
5. **Rebuild the project**: `npm run build`

### Example: Re-enabling upload_file
```typescript
// Before (disabled)
// {
//   name: "playwright_upload_file",
//   ...
// },

// After (enabled)
{
  name: "playwright_upload_file",
  description: "Upload a file to an input[type='file'] element",
  inputSchema: {
    type: "object",
    properties: {
      selector: { type: "string", description: "CSS selector for file input" },
      filePath: { type: "string", description: "Absolute path to file" }
    },
    required: ["selector", "filePath"],
  },
},
```

And add to `BROWSER_TOOLS`:
```typescript
export const BROWSER_TOOLS = [
  // ... other tools
  "playwright_upload_file", // Re-enabled
];
```

---

## Testing the Configuration

After making changes, rebuild and test:

```powershell
# Rebuild the project
npm run build

# Test with your MCP client (Claude Desktop, Cline, etc.)
# Verify only the expected 26 tools are available
```

---

## Performance Benefits

By disabling unused tools:
- ✅ **Reduced token usage** - AI sees fewer tool options (25 vs 39)
- ✅ **Faster tool selection** - Clearer context for AI decision-making
- ✅ **Less confusion** - No irrelevant API/codegen tools suggested
- ✅ **Focused workflow** - Tools align with scraping use case

---

## Summary

This configuration provides a **streamlined scraping-focused toolkit** with:
- Essential navigation and content extraction
- Interaction capabilities for bypassing gates
- Screenshot debugging tool
- Advanced features like custom user agents

Perfect for building web scrapers that need to:
1. Navigate to pages
2. Handle cookie banners and modals
3. Extract HTML/text content
4. Parse and process the data externally

---

## Change History

| Date | Change | Reason |
|------|--------|--------|
| 2025-10-01 | Disabled 14 tools (codegen, API, navigation history, upload, drag, save_as_pdf) | Optimize for web scraping use case |

---

## Related Files

- `src/tools.ts` - Tool definitions and configuration
- `src/toolHandler.ts` - Tool execution logic
- `src/config.ts` - Global configuration (headless mode, proxy)
- `README.md` - General project documentation
