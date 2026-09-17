# Native Bridge Boundary

The current runnable project uses Expo Location.

The JavaScript contract is:

```ts
getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number | null;
}>
```

A bare React Native version can preserve this contract and replace the implementation with native modules.

### iOS Swift concept

```swift
@objc(LocationModule)
class LocationModule: NSObject {
  @objc
  func getCurrentLocation(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // CLLocationManager implementation
  }
}
```

### Android Kotlin concept

```kotlin
class LocationModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "LocationModule"

  @ReactMethod
  fun getCurrentLocation(promise: Promise) {
    // FusedLocationProviderClient implementation
  }
}
```

The UI does not depend on either platform's API.
