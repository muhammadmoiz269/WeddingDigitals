import type { EInvitation } from '@/types';
import type { ComponentType } from 'react';
import { DefaultDesign } from './default/DefaultDesign';
import { Template02Design } from './template-02/Template02Design';
import Envelope02Screen from './template-02/Envelope02Screen';
import EnvelopeScreen from '../EnvelopeScreen';

type DesignComponent = ComponentType<{ invitation: EInvitation }>;
type EnvelopeComponent = ComponentType<{ invitation: EInvitation; onOpen: () => void }>;

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
  'test-tester': Template02Design,
  'arbab-and-rabia-15-november-2026': DefaultDesign,
  'arbab-and-rabia-november-2026': Template02Design,
};

/**
 * Per-slug envelope screen configuration.
 * Any slug not listed here uses the defaults (showEnvelopeImage: true).
 */
const envelopeRegistry: Record<string, EnvelopeConfig> = {
};

/**
 * Map invitation slugs to a bespoke envelope intro component that fully
 * replaces the default EnvelopeScreen (envelopeRegistry does not apply then).
 */
const envelopeComponentRegistry: Record<string, EnvelopeComponent> = {
  'arbab-and-rabia-15-november-2026': EnvelopeScreen,
  'arbab-and-rabia-november-2026': Envelope02Screen,
};

export function resolveDesign(slug: string): DesignComponent {
  return designRegistry[slug] ?? DefaultDesign;
}

export function resolveEnvelopeConfig(slug: string): EnvelopeConfig {
  return envelopeRegistry[slug] ?? {};
}

export function resolveEnvelope(slug: string): EnvelopeComponent | null {
  return envelopeComponentRegistry[slug] ?? null;
}
