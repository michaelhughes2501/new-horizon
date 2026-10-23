// Requires Jest with the jest-expo preset and @testing-library/react-native.
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders the title and default icon without requiring optional props', () => {
    render(<EmptyState title="Nothing here yet" />);

    expect(screen.getByText('Nothing here yet')).toBeTruthy();
    expect(screen.getByText('✦')).toBeTruthy();
    expect(screen.queryByText('')).toBeNull();
  });

  it('renders a custom icon and detail without the default icon', () => {
    render(<EmptyState icon="🔔" title="No alerts" detail="Check back soon — we'll keep you posted." />);

    expect(screen.getByText('🔔')).toBeTruthy();
    expect(screen.getByText('No alerts')).toBeTruthy();
    expect(screen.getByText("Check back soon — we'll keep you posted.")).toBeTruthy();
    expect(screen.queryByText('✦')).toBeNull();
  });

  it.each([undefined, ''])('omits the detail text when detail is %p', (detail) => {
    render(<EmptyState title="No results" detail={detail} />);

    expect(screen.getAllByText(/./)).toHaveLength(2);
    expect(screen.queryByText('')).toBeNull();
  });

  it('preserves an explicitly empty icon instead of substituting the default', () => {
    render(<EmptyState title="No results" icon="" />);

    expect(screen.getByText('No results')).toBeTruthy();
    expect(screen.queryByText('✦')).toBeNull();
  });

  it('updates its content and removes optional detail on rerender', () => {
    const { rerender } = render(<EmptyState icon="👥" title="No posts" detail="Try again later." />);

    rerender(<EmptyState title="No notifications" />);

    expect(screen.getByText('No notifications')).toBeTruthy();
    expect(screen.getByText('✦')).toBeTruthy();
    expect(screen.queryByText('No posts')).toBeNull();
    expect(screen.queryByText('👥')).toBeNull();
    expect(screen.queryByText('Try again later.')).toBeNull();
  });
});
