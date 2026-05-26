import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import connectToDatabase from '@/lib/mongodb';
import Card from '@/lib/models/Card';
import { cld } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadFont() {
  return readFile(join(process.cwd(), 'public/fonts/PlayfairDisplay-SemiBold.ttf'));
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const font = await loadFont();

  let title = 'Wedding Cards in Karachi';
  let category = '';
  let price = '';
  let imageUrl = '';

  try {
    await connectToDatabase();
    const doc = await Card.findOne({ slug }, 'name category base_price images').lean();
    if (doc) {
      title = doc.name;
      category = doc.category;
      price = `From PKR ${doc.base_price.toLocaleString()} / card`;
      imageUrl = doc.images?.[0] ? cld(doc.images[0], 'f_auto,q_auto,w_500,h_630,c_fill') : '';
    }
  } catch {
    // fallback to generic
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#FFFDF7',
          fontFamily: 'Playfair',
        }}
      >
        {/* Left content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '72px 64px',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontFamily: 'Playfair',
              color: '#C8A96E',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {category || 'Wedding Card'}
          </div>

          <div
            style={{
              fontSize: imageUrl ? 52 : 64,
              color: '#1F1A14',
              lineHeight: 1.1,
              maxWidth: 620,
            }}
          >
            {title}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {price && (
              <div style={{ fontSize: 24, color: '#8B6F3D', fontFamily: 'Playfair' }}>
                {price}
              </div>
            )}
            <div style={{ fontSize: 20, color: '#8B6F3D', fontFamily: 'Playfair' }}>
              Shahi Bulawa · Karachi
            </div>
          </div>
        </div>

        {/* Right: product image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            width={420}
            height={630}
            style={{ objectFit: 'cover', flexShrink: 0 }}
          />
        )}
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Playfair', data: font, style: 'normal', weight: 600 }],
    },
  );
}
