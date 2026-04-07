 MOBILE APP:
  1. No debouncing on send - causes duplicate messages
  2. Send button not disabled during mutation pending - causes duplicates
  3. Messages not sorted after fetch - ordering issues
  4. Message IDs using Date.now() - can collide
  5. Inefficient refetching on screen focus - slow reload

  BACKEND:
  1. Wrong sort order in getRecentMessages() - ascending instead of descending
  2. No idempotency checks - race conditions cause duplicates
  3. Missing indexes for performance
  4. Cache invalidation incomplete
  5. N+1 query pattern


  