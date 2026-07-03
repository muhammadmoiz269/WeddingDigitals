import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BRAND } from '@/lib/site';

export const runtime = 'nodejs';
export const alt = `All Wedding Cards — ${BRAND.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  const [font, logo, rosesTopLeft, rosesBottomRight] = await Promise.all([
    readFile(join(process.cwd(), 'public/fonts/PlayfairDisplay-SemiBold.ttf')),
    readFile(join(process.cwd(), 'public/images/logo.png')),
    readFile(join(process.cwd(), 'public/assets/roses-top-left.png')),
    readFile(join(process.cwd(), 'public/assets/roses-bottom-right.png')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: '#FFFDF7',
          fontFamily: 'Playfair',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 28,
            right: 28,
            bottom: 28,
            border: '1.5px solid rgba(200, 169, 110, 0.45)',
            borderRadius: 4,
          }}
        />
        <img
          src={`data:image/png;base64,${rosesTopLeft.toString('base64')}`}
          alt=""
          width={400}
          height={373}
          style={{ position: 'absolute', top: -80, left: -90, opacity: 0.9 }}
        />
        <img
          src={`data:image/png;base64,${rosesBottomRight.toString('base64')}`}
          alt=""
          width={400}
          height={375}
          style={{ position: 'absolute', bottom: -80, right: -90, opacity: 0.9 }}
        />

        <div
          style={{
            display: 'flex',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '2px solid rgba(200, 169, 110, 0.5)',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src={`data:image/png;base64,${logo.toString('base64')}`}
            alt=""
            width={122}
            height={122}
          />
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 17,
            color: '#C8A96E',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            marginTop: 26,
          }}
        >
          Browse the Collection
        </div>

        <div style={{ display: 'flex', fontSize: 62, color: '#1F1A14', marginTop: 12 }}>
          All Wedding Cards
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20 }}>
          <div style={{ width: 72, height: 1, background: 'rgba(200, 169, 110, 0.6)' }} />
          <div
            style={{
              width: 8,
              height: 8,
              background: '#C8A96E',
              transform: 'rotate(45deg)',
            }}
          />
          <div style={{ width: 72, height: 1, background: 'rgba(200, 169, 110, 0.6)' }} />
        </div>

        <div style={{ display: 'flex', fontSize: 26, color: '#8B6F3D', marginTop: 20 }}>
          {BRAND.name} · Starting From 80 PKR/card
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Playfair', data: font, style: 'normal', weight: 600 }],
    },
  );
}
