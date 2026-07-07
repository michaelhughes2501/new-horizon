import 'react-native-gesture-handler';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { colors } from './lib/theme';
import { NOTIFICATIONS } from './lib/demoData';
import HomeScreen from './screens/HomeScreen';
import FeedScreen from './screens/FeedScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';

type TabParamList = {
  Home: undefined;
  Feed: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof TabParamList, IoniconName> = {
  Home: 'home',
  Feed: 'people',
  Notifications: 'notifications',
  Profile: 'person-circle',
};

function TabIcon({ name, focused }: { name: keyof TabParamList; focused: boolean }) {
  const base = TAB_ICONS[name];
  const iconName = (focused ? base : `${base}-outline`) as IoniconName;
  return (
    <View style={styles.tabIcon}>
      <Ionicons name={iconName} size={22} color={focused ? colors.gold : colors.slate} />
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.ivory, card: colors.white, primary: colors.gold },
};

export default function App() {
  // Lifted here (rather than local to NotificationsScreen) so the tab-bar
  // badge count stays in sync with items the user has marked read.
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread && !readIds.has(n.id)).length;

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: colors.gold,
              tabBarInactiveTintColor: colors.slate,
              tabBarStyle: styles.tabBar,
              tabBarLabelStyle: styles.tabLabel,
              tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Feed" component={FeedScreen} options={{ tabBarLabel: 'The Yard' }} />
            <Tab.Screen
              name="Notifications"
              options={{ tabBarLabel: 'Alerts', tabBarBadge: unreadCount || undefined }}
            >
              {() => <NotificationsScreen readIds={readIds} onMarkRead={markRead} />}
            </Tab.Screen>
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </Tab.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.mist,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
  tabIcon: { alignItems: 'center', justifyContent: 'center' },
  tabDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.gold, marginTop: 2 },
});
