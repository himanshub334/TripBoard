import { memo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import ActivityRow from './ActivityRow';
import type { Trip } from '../types/trip';

type Props = { trip: Trip; selected: boolean; onPress: () => void };

function TripCard({ trip, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${trip.name}, ${trip.destination}`}
      onPress={onPress}
      style={[styles.card, selected && styles.selected]}
    >
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{trip.name}</Text>
          <Text style={styles.destination}>{trip.destination}</Text>
        </View>
        <Text style={styles.date}>{trip.startDate}</Text>
      </View>

      <FlatList
        data={trip.activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityRow activity={item} />}
        scrollEnabled={false}
        initialNumToRender={6}
        windowSize={5}
        removeClippedSubviews
      />
    </Pressable>
  );
}

export default memo(TripCard);

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  selected: { borderColor: '#2563EB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  titleBlock: { flex: 1 },
  name: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  destination: { color: '#2563EB', fontSize: 13, fontWeight: '700', marginTop: 3 },
  date: { color: '#64748B', fontSize: 12 }
});
