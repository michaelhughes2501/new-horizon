import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../lib/theme';
import { STATS } from '../lib/demoData';
import { BACKEND_READY } from '../lib/supabase';

const MENU = [
  { icon: '👤', label: 'Edit Profile' },
  { icon: '🔒', label: 'Privacy & Safety' },
  { icon: '💼', label: 'My Applications' },
  { icon: '🔖', label: 'Saved Resources' },
  { icon: '🔔', label: 'Notification Settings' },
  { icon: '❓', label: 'Help & Crisis Support' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.xl }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>MJ</Text>
        </View>
        <Text style={styles.name}>Marcus Johnson</Text>
        <Text style={styles.location}>Denver, CO · Member since 2025</Text>

        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.menu}>
        {MENU.map((m, i) => (
          <Pressable
            key={m.label}
            accessibilityRole="button"
            accessibilityLabel={m.label}
            onPress={() => {}}
            style={({ pressed }) => [
              styles.menuRow,
              i < MENU.length - 1 && styles.menuDivider,
              pressed && styles.menuRowPressed,
            ]}
          >
            <Text style={styles.menuIcon}>{m.icon}</Text>
            <Text style={styles.menuLabel}>{m.label}</Text>
            <Text style={styles.menuChevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statusPill}>
        <View style={[styles.statusDot, { backgroundColor: BACKEND_READY ? colors.success : colors.gold }]} />
        <Text style={styles.statusText}>
          {BACKEND_READY ? 'Connected to your New Horizon account' : 'Preview mode — connect Supabase to sync your data'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  header: {
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radii.full,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.charcoal, fontSize: 30, fontWeight: '700' },
  name: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: spacing.md },
  location: { color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, alignSelf: 'stretch' },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statValue: { color: colors.gold, fontSize: 20, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 },
  menu: {
    margin: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.mist,
    overflow: 'hidden',
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  menuRowPressed: { backgroundColor: colors.cream },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.mist },
  menuIcon: { fontSize: 18, width: 30 },
  menuLabel: { flex: 1, fontSize: 15, color: colors.charcoal, fontWeight: '500' },
  menuChevron: { fontSize: 22, color: colors.slate },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.cream,
    borderRadius: radii.md,
    gap: spacing.md,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { flex: 1, fontSize: 13, color: colors.slate },
});
