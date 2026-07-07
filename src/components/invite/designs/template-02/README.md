# Template-02 Design Notes

## Typography

### Current fonts (as of the last update)

| Role | CSS variable | Font | Weight |
|---|---|---|---|
| Couple names & monogram | `--font-script` | Ephesis | 400 |
| Headings (event title, sections) | `--font-heading` | Playfair Display | 700 |
| Body text | `--font-body` | Inter | — |

`--font-heading` and `--font-body` are defined globally in `src/app/layout.tsx`.  
`--font-script` (Great Vibes) is declared locally in `Template02Design.tsx` and injected via the root `className`.

---

### Original template-02 script fonts (saved for reference)

The two spots below previously used calligraphic script fonts for an ornate look.
To restore them, re-add the imports/declarations to `Template02Design.tsx` and
swap `var(--font-heading)` back to `var(--font-script), var(--font-script-alt), cursive`.

#### Used in

- `sections/Hero02.tsx` — couple names (`<h1>`)
- `sections/FaqsFooter02.tsx` — monogram in the footer

#### Font declarations (remove and restore as needed)

```ts
// Template02Design.tsx — imports
import { Great_Vibes, Pinyon_Script } from 'next/font/google';

// Primary script font
const scriptFont = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});

// Fallback script font
const scriptFontAlt = Pinyon_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script-alt',
  display: 'swap',
});
```

Add the variables to the root `className` in `Template02Design.tsx`:

```tsx
className={`inv-scroller t2-root ${scriptFont.variable} ${scriptFontAlt.variable}`}
```

Then use in the two sections:

```ts
fontFamily: 'var(--font-script), var(--font-script-alt), cursive',
```
