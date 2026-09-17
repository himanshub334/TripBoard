import { atom } from 'jotai';
import type { SyncOperation, Trip } from '../types/trip';

export const tripsAtom = atom<Trip[]>([]);
export const selectedTripIdAtom = atom<string | null>(null);
export const syncQueueAtom = atom<SyncOperation[]>([]);
export const hydratedAtom = atom(false);
export const onlineAtom = atom(true);

export const selectedTripAtom = atom((get) => {
  const id = get(selectedTripIdAtom);
  return get(tripsAtom).find((trip) => trip.id === id) ?? null;
});
