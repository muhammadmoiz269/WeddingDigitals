import type { EInvitation } from '@/types';
import type { ComponentType } from 'react';
import { DefaultDesign } from './default/DefaultDesign';

type DesignComponent = ComponentType<{ invitation: EInvitation }>;

export interface EnvelopeConfig {
  showEnvelopeImage?: boolean;
}

/**
 * Map invitation slugs to their bespoke design component.
 * Falls back to DefaultDesign for any slug not listed here.
 *
 * To add a new design: import it and add its slug as a key below.
 * Example:
 *   import { AhmedAndSaraDesign } from './ahmed-sara/AhmedAndSaraDesign';
 *   'ahmed-and-sara': AhmedAndSaraDesign,
 */
const designRegistry: Record<string, DesignComponent> = {
  // bespoke designs go here
};

/**
 * Per-slug envelope screen configuration.
 * Any slug not listed here uses the defaults (showEnvelopeImage: true).
 */
const envelopeRegistry: Record<string, EnvelopeConfig> = {
  'test-tester': { showEnvelopeImage: false },
};

export function resolveDesign(slug: string): DesignComponent {
  return designRegistry[slug] ?? DefaultDesign;
}

export function resolveEnvelopeConfig(slug: string): EnvelopeConfig {
  return envelopeRegistry[slug] ?? {};
}
