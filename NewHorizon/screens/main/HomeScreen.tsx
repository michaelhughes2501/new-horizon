import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityCard({ icon, text, time }: { icon: string; text: string; time: string }) {
  return (
    <View style={styles.activityCard}>
      <Text style={styles.activityIcon}>{icon}</Text>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>{text}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const username = user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? 'there';

  // TODO: Replace hardcoded 0s with real Supabase queries
  // e.g. const { data } = await supabase.from('connections').select('count').eq('user_id', user?.id)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeEmoji}>🌅</Text>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.welcomeUsername}>{username}!</Text>
        <Text style={styles.welcomeSub}>Ready to take on today?</Text>
      </View>

      {/* Quick Stats */}
      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.statsRow}>
        <StatCard label="Connections" value="0" />
        <StatCard label="Messages" value="0" />
        <StatCard label="Opportunities" value="0" />
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <ActivityCard
        icon="👋"
        text="Welcome to New Horizon! Start by completing your profile."
        time="Just now"
      />
      <ActivityCard
        icon="🔗"
        text="Connect with others in your community to grow your network."
        time=""
      />
      <ActivityCard
        icon="💼"
        text="Browse opportunities posted by employers who support returning citizens."
        time=""
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#334155',
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  welcomeText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  welcomeUsername: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
  welcomeSub: {
    color: '#38bdf8',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    color: '#38bdf8',
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  activityTime: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
});
