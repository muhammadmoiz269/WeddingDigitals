'use client';

import { createContext, useContext } from 'react';
import type { MotionValue } from 'framer-motion';

/**
 * Carries a 0–1 scroll-progress MotionValue from the enclosing InvSection
 * to nested Parallax components. Single source — never redefine this context
 * elsewhere or providers and consumers will silently mismatch.
 */
export const SectionProgress = createContext<MotionValue<number> | null>(null);

export function useSectionProgress() {
  return useContext(SectionProgress);
}
