import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// ==========================================
// 1. RESOURCES SCREEN (The Directory)
// ==========================================
function ResourcesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>Resource Hub</Text>
        <Text style={styles.headerSubtitle}>Tap a category to find vetted help near you.</Text>

        {/* Resource Cards - Styled like modern Bootstrap/Tailwind cards */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>🏠</Text>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Housing & Shelters</Text>
            <Text style={styles.cardDescription}>Find transitional housing and rental assistance programs.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>💼</Text>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Second-Chance Employment</Text>
            <Text style={styles.cardDescription}>Employers who actively hire formerly incarcerated individuals.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>⚖️</Text>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Legal Aid & Expungement</Text>
            <Text style={styles.cardDescription}>Free or low-cost legal clinics to help clear your record.</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// 2. COMMUNITY SCREEN (The Social Feed)
// ==========================================
function CommunityScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>Community Board</Text>
        <Text style={styles.headerSubtitle}>You are not alone. Connect with your peers.</Text>

        {/* A Community Post - Engaging and supportive */}
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.avatarPlaceholder}><Text>M</Text></View>
            <Text style={styles.postAuthor}>Marcus T. • 2h ago</Text>
          </View>
          <Text style={styles.postContent}>Just passed my CDL driving test today! It's been a long year, but staying focused on the goal is paying off. Keep pushing everyone!</Text>
          
          {/* Interactive Button to build engagement */}
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>👏 Support (12)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>💬 Comment</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
      
      {/* Floating Action Button to write a new post */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ==========================================
// 3. GOALS SCREEN (The Gamified Tracker)
// ==========================================
function GoalsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>My Progress</Text>
        <Text style={styles.headerSubtitle}>Every day is a victory. Keep your streak alive.</Text>

        {/* Gamified Streak Counter */}
        <View style={[styles.card, styles.streakCard]}>
          <Text style={styles.streakNumber}>142</Text>
          <Text style={styles.streakText}>Days of Freedom</Text>
          <Text style={styles.streakSubtext}>🔥 You are on a 4-month streak!</Text>
        </View>

        {/* Progress Bar Item */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Applications This Week</Text>
          <Text style={styles.progressText}>3 of 5 completed</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '60%' }]}></View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// NAVIGATION & ROOT APP SETUP
// ==========================================
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        screenOptions={{
          headerShown: false, 
          tabBarActiveTintColor: '#2563EB', // A nice Tailwind-style blue
          tabBarInactiveTintColor: '#9CA3AF', // Tailwind gray
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tab.Screen name="Resources" component={ResourcesScreen} options={{ tabBarIcon: () => <Text>📚</Text> }} />
        <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarIcon: () => <Text>🤝</Text> }} />
        <Tab.Screen name="Goals" component={GoalsScreen} options={{ tabBarIcon: () => <Text>⭐</Text> }} />
      </Tab.Navigator>
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}

// ==========================================
// SUPERIOR CSS-LIKE STYLES
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Tailwind gray-100
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 100, // Space for tab bar
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827', // Tailwind gray-900
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280', // Tailwind gray-500
    marginBottom: 24,
  },
  // Reusable Card Style (Like Bootstrap/Tailwind Cards)
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3, // For Android shadow
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  // Community Post Styles
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE', // Light blue
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  postContent: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    marginRight: 24,
  },
  actionText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2563EB', // Tailwind primary blue
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
  // Goals Styles
  streakCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#EFF6FF', // Very light blue
    borderColor: '#BFDBFE',
    borderWidth: 1,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#2563EB',
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginTop: 4,
  },
  streakSubtext: {
    fontSize: 14,
    color: '#F59E0B', // Amber color for fire
    marginTop: 8,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    marginTop: 4,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981', // Tailwind Emerald green
    borderRadius: 6,
  },
  tabBar: {
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    height: 60,
    paddingBottom: 10,
  }
});
