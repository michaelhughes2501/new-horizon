import { useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const HEADER_SCROLL_THRESHOLD = 200;

/**
 * Tracks whether the scroll position has passed a dark hero header, so the
 * caller can flip the status bar (or other chrome) from light to dark once
 * the lighter body content scrolls underneath it.
 */
export function useHeaderOverlap() {
  const [isHeaderOverlapping, setIsHeaderOverlapping] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const overlapped = event.nativeEvent.contentOffset.y > HEADER_SCROLL_THRESHOLD;
    if (overlapped !== isHeaderOverlapping) {
      setIsHeaderOverlapping(overlapped);
    }
  };

  return { isHeaderOverlapping, handleScroll };
}
