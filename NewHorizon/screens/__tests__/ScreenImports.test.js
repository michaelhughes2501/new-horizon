// Import/render regressions for the Home/Profile import consolidation in PR #83.
// Requires Jest with the jest-expo preset and @testing-library/react-native.
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useIsFocused } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import HomeScreen from '../HomeScreen';
import ProfileScreen from '../ProfileScreen';

jest.mock('../../lib/supabase', () => ({ BACKEND_READY: false }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, right: 0, bottom: 0, left: 0 }),
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

beforeEach(() => {
  jest.clearAllMocks();
  useIsFocused.mockReturnValue(true);
});

describe.each([
  ['Home', HomeScreen, 'Continue your journey'],
  ['Profile', ProfileScreen, 'Marcus Johnson'],
])('%s screen import regression', (_name, Screen, content) => {
  it('imports and renders with both declarative and imperative status-bar APIs', () => {
    render(<Screen />);

    expect(screen.getByText(content)).toBeTruthy();
    expect(screen.getByTestId('status-bar-light')).toBeTruthy();
    expect(setStatusBarStyle).toHaveBeenCalledTimes(1);
    expect(setStatusBarStyle).toHaveBeenCalledWith('light');
  });

  it('renders while unfocused without claiming the status bar', () => {
    useIsFocused.mockReturnValue(false);

    render(<Screen />);

    expect(screen.getByText(content)).toBeTruthy();
    expect(screen.queryByTestId('status-bar-light')).toBeNull();
    expect(setStatusBarStyle).not.toHaveBeenCalled();
  });
});
