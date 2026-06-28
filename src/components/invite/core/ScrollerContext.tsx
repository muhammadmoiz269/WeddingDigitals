'use client';

import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

/**
 * Carries the scroller container ref from the design (which owns the scroller)
 * to InvSection and Hero which both need it for useScroll. Single source —
 * never redefine this context elsewhere.
 */
export const ScrollerContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function useScroller(): RefObject<HTMLDivElement | null> {
  const ref = useContext(ScrollerContext);
  if (!ref) throw new Error('useScroller must be used inside a ScrollerContext.Provider');
  return ref;
}
