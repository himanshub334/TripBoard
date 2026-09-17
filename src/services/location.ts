import * as Location from 'expo-location';

export type DeviceLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export async function getCurrentLocation(): Promise<DeviceLocation> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    throw new Error('Location permission was not granted.');
  }

  const result = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: result.coords.latitude,
    longitude: result.coords.longitude,
    accuracy: result.coords.accuracy ?? null,
  };
}
