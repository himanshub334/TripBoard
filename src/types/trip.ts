export type Activity = {
  id: string;
  title: string;
  time: string;
  location?: string;
};

export type Trip = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  activities: Activity[];
  updatedAt: number;
};

export type SyncOperation =
  | { id: string; type: 'upsert_trip'; trip: Trip; createdAt: number }
  | { id: string; type: 'delete_trip'; tripId: string; createdAt: number };
