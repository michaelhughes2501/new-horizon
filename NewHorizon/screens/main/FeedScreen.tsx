import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';

interface Post {
  id: string;
  username: string;
  initial: string;
  text: string;
  timestamp: string;
  likes: number;
  liked: boolean;
}

const PLACEHOLDER_POSTS: Post[] = [
  {
    id: '1',
    username: 'Marcus T.',
    initial: 'M',
    text: 'Just landed my first interview after getting out. The prep resources here are amazing. Stay strong everyone 💪',
    timestamp: '2h ago',
    likes: 14,
    liked: false,
  },
  {
    id: '2',
    username: 'Jasmine R.',
    initial: 'J',
    text: 'Grateful for this community. Found a supportive employer through New Horizon. New chapter begins Monday!',
    timestamp: '5h ago',
    likes: 27,
    liked: false,
  },
  {
    id: '3',
    username: 'Dwayne P.',
    initial: 'D',
    text: 'Anyone have experience with trade certifications? Looking into electrician programs. Any advice welcome.',
    timestamp: '1d ago',
    likes: 8,
    liked: false,
  },
];

function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{post.initial}</Text>
        </View>
        <View style={styles.postMeta}>
          <Text style={styles.postUsername}>{post.username}</Text>
          <Text style={styles.postTimestamp}>{post.timestamp}</Text>
        </View>
      </View>
      <Text style={styles.postText}>{post.text}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.likeButton} onPress={() => onLike(post.id)}>
          <Text style={styles.likeIcon}>{post.liked ? '❤️' : '🤍'}</Text>
          <Text style={[styles.likeCount, post.liked && styles.likeCountActive]}>
            {post.likes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>(PLACEHOLDER_POSTS);

  const handleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Compose bar */}
      <View style={styles.composeBar}>
        <TextInput
          style={styles.composeInput}
          placeholder="Write something..."
          placeholderTextColor="#475569"
          editable={false}
        />
        <TouchableOpacity style={styles.postButton}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PostCard post={item} onLike={handleLike} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  composeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 10,
  },
  composeInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  postButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  postButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 12,
  },
  postCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
  postMeta: {
    flex: 1,
  },
  postUsername: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 15,
  },
  postTimestamp: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  postText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeIcon: {
    fontSize: 18,
  },
  likeCount: {
    color: '#64748b',
    fontSize: 14,
  },
  likeCountActive: {
    color: '#f87171',
  },
});
