# Offline SSR Testing & Fixes Plan

## Problem Analysis

### Root Causes Identified

Based on the error logs and code review, there are **three critical issues**:

#### 1. **Service Worker is Disabled in Development Mode**

```typescript
// next.config.ts line 9
disable: process.env.NODE_ENV === "development",
```

- The service worker is **completely disabled** in dev mode
- This means NO offline caching happens during `npm run dev`
- API requests fail immediately when offline (no cache fallback)

#### 2. **Non-Null Assertion Operator on Potentially Undefined Data**

```typescript
// MobileFolderPageContent.tsx lines 99-103
const unpinnedItems = folderData.data!.items.filter(...)
const pinnedItems = folderData.data!.items.filter(...)
```

- Using `folderData.data!` assumes data is always present
- When offline and no cache exists, `folderData.data` is `undefined`
- This causes: `TypeError: Cannot read properties of undefined (reading 'items')`

#### 3. **API Request with Undefined Parameter**

```
GET http://localhost:3003/api/folder/undefined
```

- The `folderId` is somehow becoming `undefined`
- This suggests a routing or parameter extraction issue

#### 4. **Clerk Authentication Fails Offline**

```
POST https://lenient-doberman-6.clerk.accounts.dev/v1/client/sessions/...
net::ERR_INTERNET_DISCONNECTED
```

- Clerk tries to validate sessions when offline
- This is expected but shouldn't break the app

---

## Testing Approach: Dev vs Production

### ❌ **Current Situation: Testing in Dev Mode**

```bash
npm run dev
```

**Problems:**

- Service worker is disabled (`disable: true` in dev)
- No caching happens
- No offline fallbacks work
- API requests fail immediately when offline
- **You CANNOT test offline functionality in dev mode**

### ✅ **Correct Approach: Test with Production Build**

```bash
# 1. Build the production version
npm run build

# 2. Start the production server
npm run start

# 3. Visit pages while ONLINE first (to cache them)
# 4. Go offline (Network tab → Offline)
# 5. Test navigation and functionality
```

**Why this works:**

- Service worker is enabled in production
- Pages and API responses get cached
- Offline fallbacks are active
- React Query can use cached data

### 🔄 **Iteration Workflow**

For each change you make:

```bash
# 1. Make code changes
# 2. Rebuild
npm run build

# 3. Restart production server
npm run start

# 4. Test online first (cache pages)
# 5. Test offline
```

**Note:** This is slower than dev mode, but it's the ONLY way to test offline/PWA features properly.

---

## Code Issues to Fix

### Issue 1: Unsafe Data Access in Components

**Problem:** Using non-null assertion (`!`) when data might be undefined

**Files affected:**

- [`app/(app)/components/Folder/MobileFolderPageContent.tsx`](<app/(app)/components/Folder/MobileFolderPageContent.tsx:99>)
- Similar patterns in other page components

**Current code:**

```typescript
// Line 86-96: Shows loading skeleton while fetching
if (folderData.isFetching) {
  return <MobileListSkeleton ... />;
}

// Line 99: UNSAFE - assumes data exists
const unpinnedItems = folderData.data!.items.filter(...)
```

**The problem:**

- `isFetching` is only `true` during the initial fetch
- If the query fails (offline, no cache), `isFetching` becomes `false` but `data` is `undefined`
- Code proceeds to line 99 and crashes

**Solution:** Add proper data existence check

```typescript
// After the isFetching check, add:
if (!folderData.data) {
  // Handle the case where we have no data (offline, no cache)
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-muted-foreground">
        Unable to load folder. Please check your connection.
      </p>
    </div>
  );
}

// Now safe to access folderData.data
const unpinnedItems = folderData.data.items.filter(...)
```

### Issue 2: Loading States Don't Cover All Cases

**Current logic:**

```typescript
if (folderData.isFetching) {
  return <MobileListSkeleton />;
}
// Assumes data exists here
```

**Better logic:**

```typescript
// Show loading during initial fetch
if (folderData.isLoading) {
  return <MobileListSkeleton />;
}

// Show error state if query failed and no cached data
if (folderData.isError && !folderData.data) {
  return <ErrorMessage error={folderData.error} />;
}

// Show stale data indicator if refetching in background
if (folderData.isFetching && folderData.data) {
  // Show data with a subtle "updating..." indicator
}

// Guard against undefined data
if (!folderData.data) {
  return <NoDataFallback />;
}

// Now safe to use data
```

### Issue 3: React Query Configuration Conflicts

**Current setup in [`app/providers.tsx`](app/providers.tsx:19-48):**

```typescript
refetchOnMount: false,  // Don't refetch on mount
networkMode: "offlineFirst",  // Use cache when offline
```

**This is mostly correct**, but consider:

1. **`refetchOnMount: false`** means pages won't get fresh data when you navigate to them
   - Good for offline (uses cache)
   - Bad for online (shows stale data)
2. **Better approach:** Use `refetchOnMount: "always"` with proper error handling
   - Online: Gets fresh data
   - Offline: Falls back to cache automatically (due to `offlineFirst`)

**Recommended change:**

```typescript
// In providers.tsx
refetchOnMount: true,  // Try to get fresh data
networkMode: "offlineFirst",  // But use cache if offline
```

---

## Service Worker Configuration

### Current Config Analysis

**[`next.config.ts`](next.config.ts:4-10):**

```typescript
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // ⚠️ Disabled in dev
});
```

**[`app/sw.ts`](app/sw.ts:13-29):**

```typescript
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache, // Uses Serwist's default cache strategies
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.mode === "navigate";
        },
      },
    ],
  },
});
```

### Recommendations

#### Option 1: Keep Dev Mode Disabled (Recommended)

- **Pros:** Faster dev experience, no cache issues during development
- **Cons:** Must use production build to test offline features
- **When to use:** Most of the time

#### Option 2: Enable in Dev Mode (For Offline Testing)

```typescript
// next.config.ts
disable: false,  // Enable in dev mode
```

- **Pros:** Can test offline features in dev mode
- **Cons:**
  - Slower dev experience
  - Cache can cause confusion (old code running)
  - Need to clear cache frequently
  - Hot reload might not work properly
- **When to use:** Only when actively developing offline features

#### Option 3: Environment Variable Toggle

```typescript
// next.config.ts
disable: process.env.ENABLE_SW !== "true",
```

Then:

```bash
# Normal dev (SW disabled)
npm run dev

# Dev with SW enabled (for offline testing)
ENABLE_SW=true npm run dev
```

---

## Action Plan

### Phase 1: Fix Critical Bugs (Immediate)

1. **Add data existence checks to all page components**

   - [`MobileFolderPageContent.tsx`](<app/(app)/components/Folder/MobileFolderPageContent.tsx:99>)
   - [`WebFolderPageContent.tsx`](<app/(app)/components/Folder/WebFolderPageContent.tsx>)
   - [`MobileNotePageContent.tsx`](<app/(app)/components/Note/MobileNotePageContent.tsx>)
   - [`WebNotePageContent.tsx`](<app/(app)/components/Note/WebNotePageContent.tsx>)
   - [`MobileChatPageContent.tsx`](<app/(app)/components/Chat/MobileChatPageContent.tsx>)
   - [`WebChatPageContent.tsx`](<app/(app)/components/Chat/WebChatPageContent.tsx>)
   - All other page components with similar patterns

2. **Improve loading/error states**

   - Use `isLoading` instead of `isFetching` for initial load
   - Add explicit error handling
   - Add "no data" fallback UI

3. **Investigate the `undefined` folderId issue**
   - Check routing parameters
   - Add validation in the page component

### Phase 2: Improve React Query Configuration (Optional)

1. **Consider changing `refetchOnMount`**

   ```typescript
   refetchOnMount: true,  // Get fresh data when online
   ```

2. **Add query-specific overrides where needed**
   ```typescript
   // For data that changes frequently
   useGetFolderById(folderId, {
     initialData: initialFolder,
     staleTime: 0, // Always consider stale
   });
   ```

### Phase 3: Testing Strategy

1. **Create a testing checklist:**

   - [ ] Build production version
   - [ ] Start production server
   - [ ] Visit all pages while ONLINE (cache them)
   - [ ] Go offline
   - [ ] Test navigation to cached pages
   - [ ] Test navigation to uncached pages
   - [ ] Test mutations (should fail gracefully)
   - [ ] Go back online
   - [ ] Verify data refreshes

2. **Document the process** in README or CONTRIBUTING guide

---

## Summary

### ✅ Correct Testing Approach

**You MUST use production build to test offline features:**

```bash
npm run build && npm run start
```

**Dev mode (`npm run dev`) will NOT work** because the service worker is disabled.

### 🐛 Main Bugs to Fix

1. **Unsafe data access** - Using `folderData.data!` without checking if data exists
2. **Incomplete loading states** - Not handling the case where query fails and no cache exists
3. **Missing error boundaries** - Need graceful fallbacks when data is unavailable

### 🎯 Next Steps

1. Fix the data access bugs (add null checks)
2. Improve loading/error states
3. Test with production build
4. Consider React Query configuration adjustments

---

## Code Examples

### Pattern to Apply Everywhere

**Before (Unsafe):**

```typescript
if (folderData.isFetching) {
  return <Skeleton />;
}

const items = folderData.data!.items;  // ❌ Crashes if data is undefined
```

**After (Safe):**

```typescript
// Show loading skeleton during initial load
if (folderData.isLoading) {
  return <Skeleton />;
}

// Handle error state with no cached data
if (folderData.isError && !folderData.data) {
  return (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">
        Unable to load data. Please check your connection.
      </p>
      <Button onClick={() => folderData.refetch()}>
        Try Again
      </Button>
    </div>
  );
}

// Guard against undefined data (shouldn't happen, but be safe)
if (!folderData.data) {
  return <div>No data available</div>;
}

// Now safe to use data
const items = folderData.data.items;  // ✅ Safe
```

### Reusable Error Component

Create a reusable component for this pattern:

```typescript
// components/QueryStateHandler.tsx
interface QueryStateHandlerProps<T> {
  query: UseQueryResult<T>;
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}

export function QueryStateHandler<T>({
  query,
  loadingFallback,
  errorFallback,
  children,
}: QueryStateHandlerProps<T>) {
  if (query.isLoading) {
    return loadingFallback || <Skeleton />;
  }

  if (query.isError && !query.data) {
    return errorFallback || <ErrorMessage error={query.error} />;
  }

  if (!query.data) {
    return <div>No data available</div>;
  }

  return <>{children(query.data)}</>;
}
```

**Usage:**

```typescript
<QueryStateHandler
  query={folderData}
  loadingFallback={<MobileListSkeleton />}
>
  {(data) => (
    <MobileList items={data.items} />
  )}
</QueryStateHandler>
```
