/**
 * Lightweight slug → template key mapping used by the OG image generator.
 * Keep in sync with registry.ts (which imports full React components and
 * cannot be imported in the Node.js OG image route).
 */

export type TemplateKey = 'default' | 'template-02';

export const slugTemplateMap: Record<string, TemplateKey> = {
  'test-tester':                      'template-02',
  'arbab-and-rabia-november-2026':    'template-02',
};

export function resolveTemplateKey(slug: string): TemplateKey {
  return slugTemplateMap[slug] ?? 'default';
}

// ─── Per-template OG themes ───────────────────────────────────────────────────

interface OGTheme {
  background:    string;
  nameColor:     string;
  ampersandColor: string;
  labelColor:    string;
  footerColor:   string;
  gradientFrom:  string;
}

export const ogThemes: Record<TemplateKey, OGTheme> = {
  'default': {
    background:     '#FFFDF7',
    nameColor:      '#1F1A14',
    ampersandColor: '#C8A96E',
    labelColor:     '#C8A96E',
    footerColor:    '#8B6F3D',
    gradientFrom:   '#FFFDF7',
  },
  'template-02': {
    background:     '#FBF7EF',
    nameColor:      '#2E4964',
    ampersandColor: '#5B7A9D',
    labelColor:     '#5B7A9D',
    footerColor:    '#3A4A5C',
    gradientFrom:   '#FBF7EF',
  },
};
