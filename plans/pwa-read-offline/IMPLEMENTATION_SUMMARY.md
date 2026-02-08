# PWA Offline Fixes - Implementation Summary

## Status: Ready for Implementation

This document summarizes the agreed-upon approach for fixing PWA offline issues.

---

## ✅ Agreed Solutions

### Issue #1: Mobile Offline Indicators

**Status:** Partially fixed, needs completion

**What's Done:**

- ✅ [`PersistentOfflineIndicator`](components/web/PersistentOfflineIndicator.tsx:1) - Hidden class removed

**What's Needed:**

1. Update [`OfflineModeBanner`](components/OfflineModeBanner.tsx:29) - Remove `hidden md:block` wrapper
2. Add responsive positioning (bottom-center on mobile, top banner on desktop)
3. Import banner in [`ClientLayoutWrapper`](<app/(app)/components/ClientLayoutWrapper.tsx:1>)

**Implementation:** See Phase 1 in [OFFLINE_FIXES_PLAN.md](plans/pwa-read-offline/OFFLINE_FIXES_PLAN.md)

---

### Issue #2: Blank Pages Offline

**Status:** Ready to implement

**Approach:** Hybrid SSR/CSR Pattern

**Key Changes:**

1. Make SSR data fetching non-blocking (try/catch, return null on failure)
2. Pass `folderId` to content components (not just initial data)
3. Remove aggressive refetch settings (`staleTime: 0`, `refetchOnMount: true`)
4. Show loading skeleton instead of error state (offline banner tells user they're offline)

**Why This Approach:**

- ✅ Avoids false positives (errors aren't always offline-related)
- ✅ Offline banner provides context
- ✅ Simpler error handling
- ✅ Better UX

**Implementation:** See Phase 2 in [OFFLINE_FIXES_PLAN.md](plans/pwa-read-offline/OFFLINE_FIXES_PLAN.md)

---

## 🤔 Open Discussion: Data Prefetching

### Your Preference

> "I think I would want to prefetch ALL notes so that the user can see any note they have, otherwise what's the point? They'll eventually hit a boundary anyway."

### The Challenge

**Pros of Prefetching All Notes:**

- ✅ Complete offline access
- ✅ No boundaries
- ✅ Best user experience
- ✅ Simple mental model

**Cons of Prefetching All Notes:**

- ⚠️ Large initial data load (1-10MB+ depending on note count)
- ⚠️ Battery drain on mobile
- ⚠️ Bandwidth usage (problematic on cellular)
- ⚠️ iOS cache limit (50MB hard limit)
- ⚠️ Slow initial app load

### Recommended Approach: Progressive Implementation

**Phase 1: Start Simple (Recommended First Step)**

```
✅ No prefetching
✅ Rely on visit-once caching
✅ Service Worker caches API responses
✅ Offline banner explains limitations
```

**Benefits:**

- Works immediately
- No bandwidth concerns
- Fast app load
- Good for most users

**Limitations:**

- Must visit pages while online first
- Unvisited pages show loading skeleton offline

---

**Phase 2: Add Smart Prefetching (Next Step)**

```
✅ Prefetch folders (lightweight)
✅ Prefetch pinned notes
✅ Prefetch recently viewed notes (last 30 days)
```

**Benefits:**

- Covers 80% of use cases
- Minimal bandwidth (~500KB-2MB)
- Most-used content available offline

**Limitations:**

- Still has boundaries for old/unvisited notes

---

**Phase 3: Add Full Prefetch as Opt-In (Future Enhancement)**

```
✅ User setting: "Download all notes for offline"
✅ Show progress indicator
✅ Only on WiFi
✅ Warn about data usage
✅ Monitor cache size
```

**Benefits:**

- User controls data usage
- Complete offline access for those who want it
- Respects bandwidth constraints

**Implementation:**

- Add settings page
- Detect WiFi vs cellular
- Show sync progress
- Handle iOS 50MB limit

---

### Data Size Estimates

| User Type    | Note Count     | Estimated Size | iOS Compatible?      |
| ------------ | -------------- | -------------- | -------------------- |
| Light User   | 10-50 notes    | 100KB-500KB    | ✅ Yes               |
| Average User | 100-200 notes  | 1-2MB          | ✅ Yes               |
| Power User   | 500-1000 notes | 5-10MB         | ✅ Yes               |
| Heavy User   | 2000+ notes    | 20MB+          | ⚠️ Approaching limit |
| With Images  | Any            | 5-10x larger   | ❌ May exceed limit  |

**iOS Safari Cache Limit: 50MB** (hard limit, can't exceed)

---

### My Recommendation

**Start with Phase 1 + 2 (No prefetch + Smart prefetch):**

1. Implement the blank page fix (Phase 2 from main plan)
2. Add Service Worker API caching (Phase 3 from main plan)
3. Add basic smart prefetching:
   - Prefetch folders (always)
   - Prefetch pinned notes (always)
   - Prefetch recent notes (last 30 days)

**Then evaluate:**

- Monitor cache sizes
- Track offline usage patterns
- Get user feedback

**If needed, add Phase 3 (Full prefetch):**

- Add as user setting
- Show progress indicator
- Only on WiFi
- Warn about data usage

This gives you:

- ✅ Immediate improvement (Phases 1-2)
- ✅ Good offline experience for most users
- ✅ Path to full offline if needed
- ✅ Respects bandwidth/battery
- ✅ iOS compatible

---

## Implementation Order

### Week 1: Core Fixes

**Day 1-2: Mobile Indicators (Phase 1)**

- Update `OfflineModeBanner` with responsive positioning
- Add to `ClientLayoutWrapper`
- Test on mobile devices

**Day 3-5: Fix Blank Pages (Phase 2)**

- Update all page.tsx files (non-blocking SSR)
- Update all content components (accept folderId)
- Remove aggressive refetch settings
- Update error handling (show skeleton, not error)
- Test thoroughly

### Week 2: Enhancements

**Day 1-2: Service Worker API Caching (Phase 3)**

- Update `app/sw.ts` with NetworkFirst strategy
- Test API response caching
- Verify offline behavior

**Day 3-5: Smart Prefetching (Optional)**

- Create `useDataPrefetch` hook
- Prefetch folders + pinned/recent notes
- Add to `ClientLayoutWrapper`
- Monitor cache sizes
- Test on various devices

### Future: Full Prefetch (If Needed)

**Week 3+: Full Prefetch with User Control**

- Add settings page
- Create `useFullPrefetch` hook
- Add progress indicator
- Implement WiFi detection
- Add cache size monitoring
- Test on iOS (50MB limit)

---

## Next Steps

1. **Review this summary** and confirm approach
2. **Decide on prefetching strategy:**
   - Option A: No prefetch (simplest)
   - Option B: Smart prefetch (recommended)
   - Option C: Full prefetch with user control (future)
3. **Switch to Code mode** to implement Phase 1 (mobile indicators)
4. **Test on real devices** (especially iOS)
5. **Implement Phase 2** (fix blank pages)
6. **Evaluate and iterate** based on results

---

## Ready to Implement?

Once you've decided on the approach, we can switch to Code mode and start with Phase 1 (mobile indicators). This is a quick win that will immediately improve the mobile experience.
