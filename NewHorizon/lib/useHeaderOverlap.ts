import { useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * Tracks whether the scroll position has passed a dark hero header, so the
 * caller can flip the status bar (or other chrome) from light to dark once
 * the lighter body content scrolls underneath it.
 *
 * `headerHeight` should come from the hero View's measured `onLayout` height
 * (which already includes its safe-area top padding) rather than a fixed
 * guess, since that varies by device and content. Until it's measured, the
 * threshold defaults to unreachable so the status bar doesn't switch early.
 */
export function useHeaderOverlap(headerHeight: number | undefined) {
  const [isHeaderOverlapping, setIsHeaderOverlapping] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (headerHeight === undefined) return;
    const overlapped = event.nativeEvent.contentOffset.y > headerHeight;
    if (overlapped !== isHeaderOverlapping) {
      setIsHeaderOverlapping(overlapped);
    }
  };

  return { isHeaderOverlapping, handleScroll };
}
