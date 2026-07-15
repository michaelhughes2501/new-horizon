import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { colors, radii, spacing, shadow, addAlpha } from '../lib/theme';
import { FEED, FeedPost } from '../lib/demoData';

function PostCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(false);
  const likeCount = post.likes + (liked ? 1 : 0);

  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.time}>{post.time} ago</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{post.tag}</Text>
        </View>
      </View>

      <Text style={styles.body}>{post.body}</Text>

      <View style={styles.actions}>
        <Pressable onPress={() => setLiked((v) => !v)} style={styles.action} hitSlop={8}>
          <Text style={[styles.actionIcon, liked && { color: colors.rose }]}>
            {liked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, liked && { color: colors.rose }]}>{likeCount}</Text>
        </Pressable>
        <View style={styles.action}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{post.comments}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => setLiked(true)} hitSlop={8} accessibilityRole="button">
          <Text style={styles.respect}>Show Respect</Text>
        </Pressable>
      </View>
    </View>
  );
}

const renderItem = ({ item }: { item: FeedPost }) => <PostCard post={item} />;

export default function FeedScreen() {
  const insets = useSafeAreaInsets();

  // This screen has a light (ivory) background right up to the status bar,
  // so it needs dark status bar icons — unlike Home/Profile, which have a
  // dark hero behind the status bar and need light icons.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('dark');
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={FEED}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top + spacing.sm, paddingBottom: spacing.md }}>
            <Text style={styles.title}>The Yard</Text>
            <Text style={styles.subtitle}>What the community is sharing today</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },
  title: { fontSize: 28, fontWeight: '700', color: colors.charcoal },
  subtitle: { fontSize: 14, color: colors.slate, marginTop: 2 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radii.full,
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.gold, fontWeight: '700', fontSize: 15 },
  author: { fontSize: 15, fontWeight: '600', color: colors.charcoal },
  time: { fontSize: 12, color: colors.slate, marginTop: 1 },
  tag: {
    backgroundColor: addAlpha(colors.gold, 0.1),
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  tagText: { fontSize: 11, color: colors.gold, fontWeight: '700', letterSpacing: 0.5 },
  body: { fontSize: 15, color: '#2C2C32', lineHeight: 22 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.mist,
    gap: spacing.lg,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: { fontSize: 15 },
  actionText: { fontSize: 13, color: colors.slate, fontWeight: '600' },
  respect: { fontSize: 13, color: colors.gold, fontWeight: '700' },
});
