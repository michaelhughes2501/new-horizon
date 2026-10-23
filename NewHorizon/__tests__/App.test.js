// Requires Jest with the jest-expo preset and @testing-library/react-native.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import App from '../App';
import { NOTIFICATIONS } from '../lib/demoData';

jest.mock('../lib/demoData', () => ({ NOTIFICATIONS: [] }));
jest.mock('../screens/HomeScreen', () => () => null);
jest.mock('../screens/FeedScreen', () => () => null);
jest.mock('../screens/ProfileScreen', () => () => null);
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return { GestureHandlerRootView: View };
});
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    DefaultTheme: { colors: {} },
    NavigationContainer: ({ children }) => <View testID="navigation-container">{children}</View>,
    useIsFocused: () => true,
    useFocusEffect: jest.fn(),
  };
});
jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return {
    // Expose route registration and badge options while mounting the real
    // NotificationsScreen under App's provider; native navigation is outside
    // this unit test's scope.
    createBottomTabNavigator: () => ({
      Navigator: ({ children }) => <View testID="tab-navigator">{children}</View>,
      Screen: ({ name, component: Component, options }) => (
        <View testID={`route-${name}`}>
          <Text>{options?.tabBarLabel ?? name}</Text>
          {options?.tabBarBadge !== undefined && (
            <Text testID={`badge-${name}`}>{options.tabBarBadge}</Text>
          )}
          <Component />
        </View>
      ),
    }),
  };
});
jest.mock('expo-status-bar', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    StatusBar: ({ style }) => <View testID={`status-bar-${style}`} />,
    setStatusBarStyle: jest.fn(),
  };
});

const connection = {
  id: 'connection',
  icon: '🤝',
  title: 'New connection',
  detail: 'A community member connected with you',
  time: '8m',
  unread: true,
};
const job = { ...connection, id: 'job', title: 'Job match', detail: 'A new role matches your profile' };
const welcome = { ...connection, id: 'welcome', title: 'Welcome', detail: 'Your fresh start begins', unread: false };

function notificationButton(item, unread = true) {
  return screen.getByRole('button', {
    name: `${item.title}. ${item.detail}${unread ? '. Unread' : ''}`,
  });
}

beforeEach(() => {
  NOTIFICATIONS.splice(0, NOTIFICATIONS.length, connection, job, welcome);
});

describe('App navigation/provider regression', () => {
  it('mounts one navigation tree and registers each tab once with a usable notifications provider', () => {
    render(<App />);

    expect(screen.getAllByTestId('navigation-container')).toHaveLength(1);
    expect(screen.getAllByTestId('tab-navigator')).toHaveLength(1);
    for (const route of ['Home', 'Feed', 'Notifications', 'Profile']) {
      expect(screen.getAllByTestId(`route-${route}`)).toHaveLength(1);
    }
    expect(screen.getByText('The Yard')).toBeTruthy();
    expect(screen.getByText('Alerts')).toBeTruthy();
    expect(notificationButton(connection)).toBeTruthy();
    expect(screen.getByTestId('badge-Notifications').props.children).toBe(2);
  });

  it('renders the imported root StatusBar once', () => {
    render(<App />);

    expect(screen.getAllByTestId('status-bar-light')).toHaveLength(1);
  });

  it('keeps the surviving tab badge and notification rows in sync when an item is read', () => {
    render(<App />);

    fireEvent.press(notificationButton(connection));

    expect(screen.getByTestId('badge-Notifications').props.children).toBe(1);
    expect(screen.getByText('1 new')).toBeTruthy();
    expect(notificationButton(connection, false)).toBeTruthy();
    expect(notificationButton(job)).toBeTruthy();
    expect(screen.queryByText('2 new')).toBeNull();
  });

  it('does not decrement the remaining count when the same item is pressed again', () => {
    render(<App />);
    fireEvent.press(notificationButton(connection));

    fireEvent.press(notificationButton(connection, false));

    expect(screen.getByTestId('badge-Notifications').props.children).toBe(1);
    expect(screen.getByText('1 new')).toBeTruthy();
    expect(notificationButton(job)).toBeTruthy();
  });

  it('does not decrement the unread count when an initially read item is pressed', () => {
    render(<App />);

    fireEvent.press(notificationButton(welcome, false));

    expect(screen.getByTestId('badge-Notifications').props.children).toBe(2);
    expect(screen.getByText('2 new')).toBeTruthy();
  });

  it('removes both unread badges after the last unread item without showing an empty list', () => {
    render(<App />);
    fireEvent.press(notificationButton(connection));

    fireEvent.press(notificationButton(job));

    expect(screen.queryByTestId('badge-Notifications')).toBeNull();
    expect(screen.queryByText(/\d+ new/)).toBeNull();
    expect(notificationButton(connection, false)).toBeTruthy();
    expect(notificationButton(job, false)).toBeTruthy();
    expect(screen.queryByText('No notifications yet')).toBeNull();
  });

  it('boots with an empty notifications list without a provider error or zero badge', () => {
    NOTIFICATIONS.splice(0);

    render(<App />);

    expect(screen.getByText('No notifications yet')).toBeTruthy();
    expect(screen.queryByTestId('badge-Notifications')).toBeNull();
    expect(screen.queryByText(/\d+ new/)).toBeNull();
    expect(screen.getAllByTestId('navigation-container')).toHaveLength(1);
  });

  it('omits the initial tab badge when notifications exist but are all already read', () => {
    NOTIFICATIONS.splice(0, NOTIFICATIONS.length, welcome);

    render(<App />);

    expect(notificationButton(welcome, false)).toBeTruthy();
    expect(screen.queryByTestId('badge-Notifications')).toBeNull();
    expect(screen.queryByText('No notifications yet')).toBeNull();
  });
});
