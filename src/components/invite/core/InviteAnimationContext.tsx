'use client';

import { createContext, useContext } from 'react';

/**
 * Signals whether the invitation content should start its entrance animations.
 * False while the content is pre-mounted silently behind an envelope overlay;
 * flips to true when the envelope fade-in begins so animations play in sync.
 */
export const InviteAnimationContext = createContext(false);

export function useInviteAnimation(): boolean {
  return useContext(InviteAnimationContext);
}
