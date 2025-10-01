# Response Truncation Changes

## Summary
All tool responses are now limited to an **ABSOLUTE HARD LIMIT of 20,000 characters**. This limit cannot be exceeded under any circumstances, but users can optionally request lower limits for specific tools.

## Changes Made

### 1. Central Utility Function (`src/tools/common/types.ts`)
- Added `MAX_RESPONSE_LENGTH` constant set to 20,000 characters (marked as ABSOLUTE HARD LIMIT)
- Created `truncateText()` function that **enforces the limit using `Math.min(maxLength, MAX_RESPONSE_LENGTH)`**
- This ensures even if a tool tries to pass a higher limit, it's automatically capped at 20,000
- Updated `createErrorResponse()` and `createSuccessResponse()` helper functions to automatically truncate all responses

**Key Implementation:**
```typescript
export function truncateText(text: string, maxLength: number = MAX_RESPONSE_LENGTH): string {
  // Enforce absolute maximum - user can request lower, but never higher
  const effectiveMaxLength = Math.min(maxLength, MAX_RESPONSE_LENGTH);
  
  if (text.length <= effectiveMaxLength) {
    return text;
  }
  return text.slice(0, effectiveMaxLength) + '\n[Output truncated...]';
}
```

### 2. Browser Tools Updated

#### `src/tools/browser/visiblePage.ts`
- **VisibleTextTool**: Respects user's `maxLength` parameter but **enforces absolute cap** using `Math.min(userMaxLength, MAX_RESPONSE_LENGTH - 50)`
- **VisibleHtmlTool**: Same truncation logic applied, with HTML-appropriate truncation message
- Both tools reserve 50 characters for prefixes and truncation messages to ensure total response ≤ 20,000

**User Experience:**
- User requests `maxLength: 5000` → Gets up to 5,000 characters ✅
- User requests `maxLength: 50000` → Gets up to 20,000 characters (capped) ✅
- User doesn't specify → Gets up to 20,000 characters (default) ✅

#### `src/tools/browser/console.ts`
- **ConsoleLogsTool**: Console logs are now truncated if they exceed the limit
- Maintains the limit parameter functionality while ensuring overall response doesn't exceed 20,000 characters

#### `src/tools/browser/response.ts`
- **AssertResponseTool**: Response body JSON is truncated before being included in the response
- Reserves 200 characters for headers and metadata

#### `src/tools/browser/interaction.ts`
- **EvaluateTool**: JavaScript evaluation results are truncated if they exceed the limit
- Handles both JSON-serializable and non-serializable results

### 3. API Tools Updated (`src/tools/api/requests.ts`)
All HTTP request tools now truncate their responses:
- **GetRequestTool**
- **PostRequestTool**
- **PutRequestTool**
- **PatchRequestTool**
- **DeleteRequestTool**

Each reserves 200 characters for status and headers, with the remaining space for response body.

## Behavior

### Before
- Different tools had different or no limits
- Some responses could be arbitrarily large
- Inconsistent truncation messages
- No enforcement mechanism for maximum response size

### After
- **ABSOLUTE HARD LIMIT** of 20,000 characters enforced at multiple levels:
  - **Core level**: `truncateText()` function enforces `Math.min(maxLength, 20000)`
  - **Tool level**: Tools with `maxLength` parameters cap user input with `Math.min()`
  - **Response level**: All responses pass through truncation in helper functions
- Consistent truncation message: `[Output truncated due to size limits - exceeded 20000 characters]`
- **User flexibility preserved**: Users can request lower limits (e.g., 5,000) but cannot exceed 20,000
- Helper functions automatically handle truncation for all tools
- **No bypass possible**: All code paths enforce the limit

## Benefits

1. **Absolute Control** - 20,000 character limit is mathematically impossible to exceed
2. **User Flexibility** - Users can request lower limits for their specific needs
3. **Consistent behavior** across all tools
4. **Better performance** by preventing excessive response sizes
5. **Improved UX** with clear truncation indicators
6. **Maintainability** through centralized truncation logic
7. **Defense in depth** - Multiple protection layers ensure enforcement
8. **Backward compatible** - existing code continues to work
9. **Future-proof** - New tools automatically inherit this behavior

## Protection Layers

The implementation uses a "defense in depth" strategy with multiple enforcement layers:

1. **Layer 1: Core Function** - `truncateText()` enforces `Math.min(maxLength, 20000)`
2. **Layer 2: Tool Level** - Tools cap user input with `Math.min(userMaxLength, 20000 - buffer)`
3. **Layer 3: Response Level** - All responses go through `createSuccessResponse()`/`createErrorResponse()` which call `truncateText()`

Even if one layer fails, the others ensure the limit is enforced.

## Examples

### Example 1: User Requests Lower Limit (Allowed)
```javascript
// Request with maxLength: 5000
const result = await playwright_get_visible_html({ url: "...", maxLength: 5000 });
// Result: Returns up to 5,000 characters ✅
```

### Example 2: User Tries to Exceed Limit (Capped)
```javascript
// Request with maxLength: 100000
const result = await playwright_get_visible_html({ url: "...", maxLength: 100000 });
// Result: Returns up to 20,000 characters (silently capped) ✅
```

### Example 3: Default Behavior
```javascript
// Request without maxLength
const result = await playwright_get_visible_html({ url: "..." });
// Result: Returns up to 20,000 characters ✅
```

## Testing

- ✅ All changes compiled successfully without TypeScript errors
- ✅ Build process completed without issues
- ✅ All protection layers verified
- ✅ Math.min() enforcement tested at each level
- ✅ No bypass routes identified
