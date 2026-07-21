import React, { useState, useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { StatusBar, setStatusBarStyle } from 'expo-status-bar';
import { colors, radii, spacing, shadow, addAlpha } from '../lib/theme';
import { STATS, JOURNEY } from '../lib/demoData';
import { useHeaderOverlap } from '../lib/useHeaderOverlap';

const accentMap = {
  gold: colors.gold,
  info: colors.info,
  success: colors.success,
  rose: colors.rose,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [heroHeight, setHeroHeight] = useState<number | undefined>(undefined);
  const { isHeaderOverlapping, handleScroll } = useHeaderOverlap(heroHeight);

  // Dark (charcoal) hero sits behind the status bar — needs light icons.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
    }, [])
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {/* Dark hero header at the top of this tab needs light status bar content, but
          switches to dark once the ivory body scrolls underneath the status bar. */}
      {isFocused && <StatusBar style={isHeaderOverlapping ? 'dark' : 'light'} />}
      {/* Hero */}
      <View
        style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}
        onLayout={(e) => setHeroHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.heroGlow} />
        <Text style={styles.kicker}>NEW HORIZON</Text>
        <Text style={styles.heroTitle}>Good morning,</Text>
        <Text style={styles.heroName}>
          Marcus <Text style={styles.heroSpark}>✦</Text>
        </Text>
        <View style={styles.affirmation}>
          <Text style={styles.affirmationText}>
            “Every day above ground is a good day. You’ve got 34 of them in a row.”
          </Text>
        </View>

        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Journey */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Continue your journey</Text>
        {JOURNEY.map((j) => (
          <Pressable
            key={j.title}
            accessibilityRole="button"
            accessibilityLabel={`${j.title}. ${j.detail}`}
            onPress={() => Alert.alert(j.title, 'This feature is coming soon.')}
            style={({ pressed }) => [styles.card, shadow.card, pressed && styles.cardPressed]}
          >
            <View style={[styles.cardIcon, { backgroundColor: addAlpha(accentMap[j.accent], 0.1) }]}>
              <Text style={styles.cardIconText}>{j.icon}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{j.title}</Text>
              <Text style={styles.cardDetail}>{j.detail}</Text>
            </View>
            <Text style={[styles.cardChevron, { color: accentMap[j.accent] }]}>→</Text>
          </Pressable>
        ))}
      </View>

      {/* Encouragement banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerQuote}>You are not your record.</Text>
        <Text style={styles.bannerSub}>You are everything you do next.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  hero: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.gold,
    opacity: 0.16,
  },
  kicker: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  heroTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 20, fontWeight: '300' },
  heroName: { color: colors.white, fontSize: 34, fontWeight: '700', marginTop: 2 },
  heroSpark: { color: colors.gold },
  affirmation: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.md,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
  },
  affirmationText: { color: '#D8D8DE', fontSize: 14, fontStyle: 'italic', lineHeight: 21 },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statValue: { color: colors.gold, fontSize: 22, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2, letterSpacing: 0.5 },
  section: { padding: spacing.xl, paddingBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  cardPressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: { fontSize: 22 },
  cardBody: { flex: 1, marginLeft: spacing.lg },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.charcoal },
  cardDetail: { fontSize: 13, color: colors.slate, marginTop: 2 },
  cardChevron: { fontSize: 20, fontWeight: '700' },
  banner: {
    margin: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  bannerQuote: { color: colors.charcoal, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  bannerSub: { color: '#3A2E16', fontSize: 14, marginTop: 4, textAlign: 'center' },
});
