// Requires Jest with the jest-expo preset and @testing-library/react-native.
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import FeedScreen from '../FeedScreen';
import { FEED } from '../../lib/demoData';

jest.mock('../../lib/demoData', () => ({ FEED: [] }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
  useFocusEffect: jest.fn(),
}));
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
  setStatusBarStyle: jest.fn(),
}));

const post = {
  id: 'post-1',
  author: 'Test Member',
  initials: 'TM',
  time: '1m',
  body: 'A new community update.',
  likes: 0,
  comments: 0,
  tag: 'Milestone',
};
const emptyTitle = 'The Yard is quiet right now';
const emptyDetail = 'Check back soon — new posts from the community will show up here.';

beforeEach(() => {
  FEED.splice(0);
});

describe('FeedScreen empty state', () => {
  it('keeps the list header and shows helpful copy and an icon when the feed is empty', () => {
    render(<FeedScreen />);

    expect(screen.getByText('The Yard')).toBeTruthy();
    expect(screen.getByText('What the community is sharing today')).toBeTruthy();
    expect(screen.getByText(emptyTitle)).toBeTruthy();
    expect(screen.getByText(emptyDetail)).toBeTruthy();
    expect(screen.getByText('👥')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Show respect' })).toBeNull();
  });

  it('renders a single post instead of the empty state', () => {
    FEED.push(post);

    render(<FeedScreen />);

    expect(screen.getByText(post.author)).toBeTruthy();
    expect(screen.getByText(post.body)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Show respect' })).toBeTruthy();
    expect(screen.queryByText(emptyTitle)).toBeNull();
    expect(screen.queryByText(emptyDetail)).toBeNull();
  });

  it('renders each post once without inserting an empty state among posts', () => {
    FEED.push(post, { ...post, id: 'post-2', author: 'Another Member', body: 'Another update.' });

    render(<FeedScreen />);

    expect(screen.getAllByText(post.body)).toHaveLength(1);
    expect(screen.getAllByText('Another update.')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Show respect' })).toHaveLength(2);
    expect(screen.queryByText(emptyTitle)).toBeNull();
  });

  it('replaces the empty state when posts become available', () => {
    const { rerender } = render(<FeedScreen />);
    expect(screen.getByText(emptyTitle)).toBeTruthy();

    FEED.push(post);
    rerender(<FeedScreen />);

    expect(screen.getByText(post.body)).toBeTruthy();
    expect(screen.queryByText(emptyTitle)).toBeNull();
    expect(screen.queryByText(emptyDetail)).toBeNull();
  });

  it('shows the empty state again when the final post is removed', () => {
    FEED.push(post);
    const { rerender } = render(<FeedScreen />);
    expect(screen.getByText(post.body)).toBeTruthy();

    FEED.splice(0);
    rerender(<FeedScreen />);

    expect(screen.getByText(emptyTitle)).toBeTruthy();
    expect(screen.getByText(emptyDetail)).toBeTruthy();
    expect(screen.queryByText(post.body)).toBeNull();
    expect(screen.getByText('The Yard')).toBeTruthy();
  });
});
