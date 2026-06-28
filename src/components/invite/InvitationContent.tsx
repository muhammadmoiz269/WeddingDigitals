'use client';

/**
 * Thin compatibility shim.
 *
 * All invitation logic now lives under:
 *   designs/default/DefaultDesign.tsx  — the default design
 *   designs/registry.ts                — slug → design resolver
 *
 * InvitePageClient uses resolveDesign() directly.
 * This file stays so any stray import of InvitationContent still compiles.
 */
export { DefaultDesign as default } from './designs/default/DefaultDesign';
