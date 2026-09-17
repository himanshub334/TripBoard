# Architecture

## State

Jotai atoms isolate trip data, selected trip, sync queue, hydration, and connectivity.

## Offline-first

Mutations update the local Jotai state and AsyncStorage immediately. When offline, a serializable operation is placed in the persistent sync queue.

When connectivity returns, the sync worker flushes the queue.

A production backend should add authentication, retries, idempotency, conflict resolution, and server acknowledgements.

## Location

The UI depends only on `getCurrentLocation()`.

The runnable implementation uses Expo Location, which bridges to native iOS/Android location services. This creates the same abstraction boundary you would use for custom Swift/Kotlin NativeModules.

## Performance

- FlatList virtualization
- bounded initial render/window
- removeClippedSubviews
- memoized ActivityRow
- memoized TripCard
- useMemo/useCallback around derived data and callbacks

Measure actual release-build performance before claiming a numeric improvement.
