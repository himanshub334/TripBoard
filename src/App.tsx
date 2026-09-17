import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform,
  Pressable, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAtom } from 'jotai';
import TripCard from './components/TripCard';
import { getCurrentLocation } from './services/location';
import { enqueue, flushQueue } from './services/sync';
import { loadQueue, loadTrips, saveQueue, saveTrips } from './services/storage';
import { hydratedAtom, onlineAtom, selectedTripIdAtom, syncQueueAtom, tripsAtom } from './state/atoms';
import type { Trip } from './types/trip';
import { createId } from './utils/id';

const seedTrips: Trip[] = [
  {
    id: 'trip_tokyo', name: 'Tokyo Explorer', destination: 'Tokyo, Japan',
    startDate: 'Oct 12', endDate: 'Oct 18', updatedAt: Date.now(),
    activities: [
      { id: 'a1', title: 'Arrive at Haneda Airport', time: '09:30', location: 'Haneda Airport' },
      { id: 'a2', title: 'Shibuya crossing', time: '14:00', location: 'Shibuya' },
      { id: 'a3', title: 'Dinner reservation', time: '19:30', location: 'Shinjuku' }
    ]
  },
  {
    id: 'trip_goa', name: 'Goa Weekend', destination: 'Goa, India',
    startDate: 'Nov 02', endDate: 'Nov 05', updatedAt: Date.now(),
    activities: [
      { id: 'a4', title: 'Check in', time: '12:00', location: 'Calangute' },
      { id: 'a5', title: 'Beach sunset', time: '17:45', location: 'Candolim Beach' }
    ]
  }
];

export default function App() {
  const [trips, setTrips] = useAtom(tripsAtom);
  const [selectedId, setSelectedId] = useAtom(selectedTripIdAtom);
  const [online, setOnline] = useAtom(onlineAtom);
  const [hydrated, setHydrated] = useAtom(hydratedAtom);
  const [queue, setQueue] = useAtom(syncQueueAtom);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    Promise.all([loadTrips(), loadQueue()]).then(([savedTrips, savedQueue]) => {
      const initialTrips = savedTrips.length ? savedTrips : seedTrips;
      setTrips(initialTrips);
      setQueue(savedQueue);
      setSelectedId(initialTrips[0]?.id ?? null);
      setHydrated(true);
    });

    return unsubscribe;
  }, [setHydrated, setOnline, setQueue, setSelectedId, setTrips]);

  useEffect(() => {
    if (!online || !queue.length) return;
    flushQueue().then(() => setQueue([]));
  }, [online, queue.length, setQueue]);

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === selectedId) ?? null,
    [selectedId, trips]
  );

  const persist = useCallback(async (next: Trip[]) => {
    setTrips(next);
    await saveTrips(next);
  }, [setTrips]);

  const createTrip = useCallback(async () => {
    if (!name.trim() || !destination.trim()) {
      Alert.alert('Missing details', 'Add a trip name and destination.');
      return;
    }

    const trip: Trip = {
      id: createId('trip'), name: name.trim(), destination: destination.trim(),
      startDate: startDate.trim() || 'Flexible', endDate: 'Flexible',
      updatedAt: Date.now(), activities: []
    };

    await persist([trip, ...trips]);

    const op = { id: createId('sync'), type: 'upsert_trip' as const, trip, createdAt: Date.now() };
    if (!online) {
      await enqueue(op);
      const nextQueue = [...queue, op];
      setQueue(nextQueue);
      await saveQueue(nextQueue);
    }

    setSelectedId(trip.id);
    setName(''); setDestination(''); setStartDate('');
    setModalVisible(false);
  }, [destination, name, online, persist, queue, setQueue, setSelectedId, startDate, trips]);

  const deleteSelected = useCallback(async () => {
    if (!selectedTrip) return;

    const remaining = trips.filter((trip) => trip.id !== selectedTrip.id);
    await persist(remaining);

    const op = { id: createId('sync'), type: 'delete_trip' as const, tripId: selectedTrip.id, createdAt: Date.now() };
    if (!online) {
      await enqueue(op);
      const nextQueue = [...queue, op];
      setQueue(nextQueue);
      await saveQueue(nextQueue);
    }
    setSelectedId(remaining[0]?.id ?? null);
  }, [online, persist, queue, selectedTrip, setQueue, setSelectedId, trips]);

  const showLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      Alert.alert('Current location', `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`);
    } catch (error) {
      Alert.alert('Location unavailable', error instanceof Error ? error.message : 'Try again later.');
    }
  }, []);

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your trips…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.top}>
          <View>
            <Text style={styles.kicker}>TRIPBOARD</Text>
            <Text style={styles.heading}>Your trips</Text>
          </View>
          <View style={[styles.statusPill, online ? styles.online : styles.offline]}>
            <Text style={styles.statusText}>{online ? '● Online' : '● Offline'}</Text>
          </View>
        </View>

        <View style={styles.toolbar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Create a new trip" style={styles.primary} onPress={() => setModalVisible(true)}>
            <Text style={styles.primaryText}>+ New trip</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Use device location" style={styles.secondary} onPress={showLocation}>
            <Text style={styles.secondaryText}>Location</Text>
          </Pressable>
        </View>

        {queue.length > 0 && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{queue.length} offline change{queue.length === 1 ? '' : 's'} waiting to sync.</Text>
          </View>
        )}

        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TripCard trip={item} selected={item.id === selectedId} onPress={() => setSelectedId(item.id)} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No trips yet</Text>
              <Text style={styles.emptyText}>Create your first itinerary.</Text>
            </View>
          }
        />

        {selectedTrip && (
          <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${selectedTrip.name}`} style={styles.delete} onPress={() =>
            Alert.alert('Delete trip?', `Remove ${selectedTrip.name} from this device?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: deleteSelected }
            ])
          }>
            <Text style={styles.deleteText}>Delete selected trip</Text>
          </Pressable>
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create trip</Text>
            <Text style={styles.modalDescription}>Saved locally first, even without a network connection.</Text>

            <Text style={styles.label}>Trip name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Japan Adventure" placeholderTextColor="#94A3B8" style={styles.input} accessibilityLabel="Trip name" />

            <Text style={styles.label}>Destination</Text>
            <TextInput value={destination} onChangeText={setDestination} placeholder="Tokyo, Japan" placeholderTextColor="#94A3B8" style={styles.input} accessibilityLabel="Destination" />

            <Text style={styles.label}>Start date</Text>
            <TextInput value={startDate} onChangeText={setStartDate} placeholder="Oct 12" placeholderTextColor="#94A3B8" style={styles.input} accessibilityLabel="Start date" />

            <View style={styles.actions}>
              <Pressable style={styles.secondary} onPress={() => setModalVisible(false)}><Text style={styles.secondaryText}>Cancel</Text></Pressable>
              <Pressable style={styles.primary} onPress={createTrip}><Text style={styles.primaryText}>Save trip</Text></Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 18 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, color: '#64748B' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 18, paddingBottom: 14 },
  kicker: { fontSize: 11, fontWeight: '900', letterSpacing: 2, color: '#2563EB' },
  heading: { marginTop: 4, color: '#0F172A', fontSize: 32, fontWeight: '900' },
  statusPill: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 7 },
  online: { backgroundColor: '#DCFCE7' },
  offline: { backgroundColor: '#FEF3C7' },
  statusText: { fontSize: 12, fontWeight: '800', color: '#334155' },
  toolbar: { flexDirection: 'row', gap: 9, marginBottom: 12 },
  primary: { minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, borderRadius: 11, backgroundColor: '#2563EB' },
  primaryText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  secondary: { minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, borderRadius: 11, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1' },
  secondaryText: { color: '#0F172A', fontSize: 14, fontWeight: '800' },
  banner: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', padding: 10, borderRadius: 10, marginBottom: 12 },
  bannerText: { color: '#9A3412', fontSize: 13, fontWeight: '700' },
  list: { paddingBottom: 20 },
  empty: { alignItems: 'center', padding: 50 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  emptyText: { marginTop: 6, color: '#64748B' },
  delete: { alignItems: 'center', paddingVertical: 12 },
  deleteText: { color: '#DC2626', fontWeight: '800' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.45)' },
  modal: { backgroundColor: '#FFF', padding: 22, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle: { fontSize: 25, fontWeight: '900', color: '#0F172A' },
  modalDescription: { marginTop: 5, marginBottom: 16, color: '#64748B' },
  label: { marginTop: 10, marginBottom: 6, fontSize: 13, fontWeight: '800', color: '#334155' },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, color: '#0F172A', backgroundColor: '#FFF' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 20 }
});
