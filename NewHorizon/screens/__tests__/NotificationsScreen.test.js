// Requires Jest with the jest-expo preset and @testing-library/react-native.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useIsFocused } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import NotificationsScreen from '../NotificationsScreen';
import { NOTIFICATIONS } from '../../lib/demoData';
import { NotificationsContext } from '../../lib/notificationsContext';

jest.mock('../../lib/demoData', () => ({ NOTIFICATIONS: [] }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const useIsFocused = jest.fn(() => true);
  return {
    useIsFocused,
    useFocusEffect: (effect) => {
      const focused = useIsFocused();
      React.useEffect(() => (focused ? effect() : undefined), [effect, focused]);
    },
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

const notification = {
  id: 'notification-1',
  icon: '🤝',
  title: 'New connection',
  detail: 'A community member connected with you',
  time: '8m',
  unread: true,
};
const emptyTitle = 'No notifications yet';
const emptyDetail = "We'll let you know here when there's something new — connections, job matches, and reminders.";

let context;

function notificationScreen() {
  return (
    <NotificationsContext.Provider value={context}>
      <NotificationsScreen />
    </NotificationsContext.Provider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  useIsFocused.mockReturnValue(true);
  NOTIFICATIONS.splice(0);
  context = { hasRead: jest.fn(() => false), markRead: jest.fn() };
});

describe('NotificationsScreen', () => {
  it('shows the header, empty-state copy and bell without rows or an unread badge', () => {
    render(notificationScreen());

    expect(screen.getByText('Notifications')).toBeTruthy();
    expect(screen.getByText(emptyTitle)).toBeTruthy();
    expect(screen.getByText(emptyDetail)).toBeTruthy();
    expect(screen.getByText('🔔')).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByText(/\d+ new/)).toBeNull();
    expect(context.markRead).not.toHaveBeenCalled();
  });

  it('renders one unread notification instead of the empty state', () => {
    NOTIFICATIONS.push(notification);

    render(notificationScreen());

    expect(screen.getByText(notification.title)).toBeTruthy();
    expect(screen.getByText(notification.detail)).toBeTruthy();
    expect(screen.getByText(notification.time)).toBeTruthy();
    expect(screen.getByText(notification.icon)).toBeTruthy();
    expect(screen.getByText('1 new')).toBeTruthy();
    expect(screen.getByRole('button', {
      name: `${notification.title}. ${notification.detail}. Unread`,
    })).toBeTruthy();
    expect(screen.queryByText(emptyTitle)).toBeNull();
    expect(screen.queryByText(emptyDetail)).toBeNull();
  });

  it('counts only unread items that have not been marked read in context', () => {
    NOTIFICATIONS.push(
      notification,
      { ...notification, id: 'notification-2', title: 'Job match' },
      { ...notification, id: 'notification-3', title: 'Welcome', unread: false },
    );
    context.hasRead.mockImplementation((id) => id === 'notification-1');

    render(notificationScreen());

    expect(screen.getByText('1 new')).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', {
      name: `${notification.title}. ${notification.detail}`,
    })).toBeTruthy();
    expect(screen.getByRole('button', {
      name: `Job match. ${notification.detail}. Unread`,
    })).toBeTruthy();
    expect(screen.getByRole('button', {
      name: `Welcome. ${notification.detail}`,
    })).toBeTruthy();
  });

  it.each(['already read in data', 'marked read in context'])(
    'keeps a populated list when all notifications are %s',
    (state) => {
      NOTIFICATIONS.push({ ...notification, unread: state !== 'already read in data' });
      context.hasRead.mockReturnValue(state === 'marked read in context');

      render(notificationScreen());

      expect(screen.getByRole('button', {
        name: `${notification.title}. ${notification.detail}`,
      })).toBeTruthy();
      expect(screen.queryByText(/\d+ new/)).toBeNull();
      expect(screen.queryByText(emptyTitle)).toBeNull();
    },
  );

  it('passes the pressed notification id to the provider exactly once', () => {
    NOTIFICATIONS.push(notification);
    render(notificationScreen());

    fireEvent.press(screen.getByRole('button', {
      name: `${notification.title}. ${notification.detail}. Unread`,
    }));

    expect(context.markRead).toHaveBeenCalledTimes(1);
    expect(context.markRead).toHaveBeenCalledWith(notification.id);
  });

  it('switches between empty and populated states as the data changes', () => {
    const { rerender } = render(notificationScreen());
    expect(screen.getByText(emptyTitle)).toBeTruthy();

    NOTIFICATIONS.push(notification);
    rerender(notificationScreen());

    expect(screen.getByText(notification.title)).toBeTruthy();
    expect(screen.queryByText(emptyTitle)).toBeNull();

    NOTIFICATIONS.splice(0);
    rerender(notificationScreen());

    expect(screen.getByText(emptyTitle)).toBeTruthy();
    expect(screen.queryByText(notification.title)).toBeNull();
    expect(screen.queryByText(/\d+ new/)).toBeNull();
  });

  it('sets dark status-bar content once per focus and does not repeat it on rerender', () => {
    const { rerender } = render(notificationScreen());

    expect(screen.getByTestId('status-bar-dark')).toBeTruthy();
    expect(setStatusBarStyle).toHaveBeenCalledTimes(1);
    expect(setStatusBarStyle).toHaveBeenCalledWith('dark');

    rerender(notificationScreen());
    expect(setStatusBarStyle).toHaveBeenCalledTimes(1);

    useIsFocused.mockReturnValue(false);
    rerender(notificationScreen());
    expect(screen.queryByTestId('status-bar-dark')).toBeNull();
    expect(setStatusBarStyle).toHaveBeenCalledTimes(1);

    useIsFocused.mockReturnValue(true);
    rerender(notificationScreen());
    expect(screen.getByTestId('status-bar-dark')).toBeTruthy();
    expect(setStatusBarStyle).toHaveBeenCalledTimes(2);
  });

  it('still requires its provider when the notification list is empty', () => {
    expect(() => render(<NotificationsScreen />)).toThrow(
      'NotificationsScreen must be rendered within NotificationsContext.Provider',
    );
  });
});
