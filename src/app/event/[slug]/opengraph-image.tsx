import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { EVENT_LANDING } from '@/lib/events';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return EVENT_LANDING.map((e) => ({ slug: e.slug }));
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const font = await readFile(join(process.cwd(), 'public/fonts/PlayfairDisplay-SemiBold.ttf'));
  const entry = EVENT_LANDING.find((e) => e.slug === slug);
  const title = entry?.h1 ?? 'Wedding Cards in Karachi';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FFFDF7',
          padding: '80px',
          fontFamily: 'Playfair',
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: '#C8A96E',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Event Collection
        </div>

        <div style={{ fontSize: 64, color: '#1F1A14', lineHeight: 1.1, maxWidth: 900 }}>
          {title}
        </div>

        <div style={{ fontSize: 28, color: '#8B6F3D' }}>Shahi Bulawa · Karachi</div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Playfair', data: font, style: 'normal', weight: 600 }],
    },
  );
}
