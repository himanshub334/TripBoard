import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Activity } from '../types/trip';

function ActivityRow({ activity }: { activity: Activity }) {
  return (
    <View style={styles.row}>
      <Text style={styles.time}>{activity.time}</Text>
      <View style={styles.dot} />
      <View style={styles.content}>
        <Text style={styles.title}>{activity.title}</Text>
        {activity.location ? <Text style={styles.location}>{activity.location}</Text> : null}
      </View>
    </View>
  );
}

export default memo(ActivityRow);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  time: { width: 58, color: '#64748B', fontSize: 12, fontWeight: '700' },
  dot: { width: 9, height: 9, borderRadius: 5, marginTop: 4, marginRight: 12, backgroundColor: '#2563EB' },
  content: { flex: 1 },
  title: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  location: { color: '#64748B', fontSize: 12, marginTop: 2 }
});
