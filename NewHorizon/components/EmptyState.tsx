import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../lib/theme';

type EmptyStateProps = {
  icon?: string;
  title: string;
  detail?: string;
};

/**
 * Shared empty-state block for lists that can legitimately have nothing to
 * show (an empty feed, no notifications yet, etc.) so every tab handles that
 * case with the same look instead of rendering a blank screen.
 */
export function EmptyState({ icon = '✦', title, detail }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: { fontSize: 24, color: colors.gold },
  title: { fontSize: 16, fontWeight: '600', color: colors.charcoal, textAlign: 'center' },
  detail: {
    fontSize: 13,
    color: colors.slate,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 260,
  },
});
