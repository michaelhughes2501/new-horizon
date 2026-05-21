import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const username = user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? 'User';
  const email = user?.email ?? '';
  const initial = username.charAt(0).toUpperCase();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            await signOut();
            setSigningOut(false);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Edit Profile */}
      <TouchableOpacity style={styles.editButton} onPress={() => {}}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Settings Section */}
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingsSection}>
        <TouchableOpacity style={styles.settingsRow} onPress={() => {}}>
          <Text style={styles.settingsIcon}>🔔</Text>
          <Text style={styles.settingsLabel}>Notifications</Text>
          <Text style={styles.settingsArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.settingsRow} onPress={() => {}}>
          <Text style={styles.settingsIcon}>🔒</Text>
          <Text style={styles.settingsLabel}>Privacy</Text>
          <Text style={styles.settingsArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.settingsRow} onPress={() => {}}>
          <Text style={styles.settingsIcon}>❓</Text>
          <Text style={styles.settingsLabel}>Help &amp; Support</Text>
          <Text style={styles.settingsArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.signOutButton, signingOut && styles.signOutButtonDisabled]}
        onPress={handleSignOut}
        disabled={signingOut}
      >
        <Text style={styles.signOutText}>
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </Text>
      </TouchableOpacity>
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
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '800',
    color: '#0f172a',
  },
  username: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
  },
  email: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
  editButton: {
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  editButtonText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  settingsSection: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 32,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  settingsIcon: {
    fontSize: 18,
  },
  settingsLabel: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 15,
  },
  settingsArrow: {
    color: '#475569',
    fontSize: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#334155',
    marginLeft: 46,
  },
  signOutButton: {
    width: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
