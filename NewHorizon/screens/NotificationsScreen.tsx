import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../lib/theme';
import { NOTIFICATIONS } from '../lib/demoData';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing.xxl, paddingTop: insets.top + spacing.sm }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread} new</Text>
          </View>
        )}
      </View>

      <View style={styles.list}>
        {NOTIFICATIONS.map((n) => (
          <View key={n.id} style={[styles.row, n.unread && styles.rowUnread]}>
            <View style={styles.icon}>
              <Text style={styles.iconText}>{n.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{n.title}</Text>
              <Text style={styles.rowDetail}>{n.detail}</Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.time}>{n.time}</Text>
              {n.unread && <View style={styles.dot} />}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.charcoal },
  badge: { backgroundColor: colors.rose, borderRadius: radii.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  list: { paddingHorizontal: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  rowUnread: { borderColor: colors.gold + '66', backgroundColor: '#FFFDF8' },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radii.full,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: { fontSize: 19 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.charcoal },
  rowDetail: { fontSize: 13, color: colors.slate, marginTop: 1 },
  meta: { alignItems: 'flex-end', gap: 6 },
  time: { fontSize: 12, color: colors.slate },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
});
