import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SyncOperation, Trip } from '../types/trip';

const TRIPS_KEY = '@tripboard/trips/v1';
const QUEUE_KEY = '@tripboard/sync-queue/v1';

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

export const loadTrips = () => readJson<Trip[]>(TRIPS_KEY, []);
export const loadQueue = () => readJson<SyncOperation[]>(QUEUE_KEY, []);

export async function saveTrips(trips: Trip[]) {
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export async function saveQueue(queue: SyncOperation[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}
