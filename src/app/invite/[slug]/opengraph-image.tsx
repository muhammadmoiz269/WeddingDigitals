import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import connectToDatabase from '@/lib/mongodb';
import EInvitationModel from '@/lib/models/EInvitation';
import { cld } from '@/lib/cloudinary';
import { resolveTemplateKey, ogThemes } from '@/components/invite/designs/templateKeys';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const font = await readFile(join(process.cwd(), 'public/fonts/PlayfairDisplay-SemiBold.ttf'));

  const theme = ogThemes[resolveTemplateKey(slug)];

  let groomName  = '';
  let brideName  = '';
  let eventTitle = '';
  let dateStr    = '';
  let imageUrl   = '';

  try {
    await connectToDatabase();
    const doc = await EInvitationModel
      .findOne({ slug, status: 'published' }, 'couple media wedding_at')
      .lean();
    if (doc) {
      groomName  = doc.couple.groom_name;
      brideName  = doc.couple.bride_name;
      eventTitle = doc.couple.event_title;
      if (doc.wedding_at) {
        dateStr = new Date(doc.wedding_at).toLocaleDateString('en-PK', {
          day: 'numeric', month: 'long', year: 'numeric',
        });
      }
      if (doc.media?.image_url) {
        imageUrl = cld(doc.media.image_url, 'f_auto,q_auto,w_500,h_630,c_fill,g_face');
      }
    }
  } catch {
    // fall through to generic layout
  }

  const hasPhoto  = !!imageUrl;
  // Smaller font for long names to prevent overflow; even smaller when photo takes up space
  const nameFontSz = hasPhoto ? 52 : 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: theme.background,
          fontFamily: 'Playfair',
        }}
      >
        {/* ── Left text panel ─────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '72px 64px',
            minWidth: 0,
          }}
        >
          {/* Top label */}
          <div
            style={{
              display: 'flex',
              fontSize: 13,
              color: theme.labelColor,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Wedding Invitation
          </div>

          {/* Couple names — 3 rows stacked in a column, no fragments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', fontSize: nameFontSz, color: theme.nameColor, lineHeight: 1.15 }}>
              {groomName || 'Groom'}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: nameFontSz * 0.48,
                color: theme.ampersandColor,
                fontStyle: 'italic',
                lineHeight: 1.6,
                letterSpacing: '0.1em',
              }}
            >
              {'&'}
            </div>
            <div style={{ display: 'flex', fontSize: nameFontSz, color: theme.nameColor, lineHeight: 1.15 }}>
              {brideName || 'Bride'}
            </div>
          </div>

          {/* Bottom footer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(eventTitle || dateStr) && (
              <div style={{ display: 'flex', fontSize: 18, color: theme.footerColor }}>
                {[eventTitle, dateStr].filter(Boolean).join(' · ')}
              </div>
            )}
            <div style={{ display: 'flex', fontSize: 20, color: theme.footerColor }}>
              Shahi Bulawa · Karachi
            </div>
          </div>
        </div>

        {/* ── Right: couple photo ─────────────────────────────────────── */}
        {hasPhoto && (
          <div style={{ width: 420, height: 630, display: 'flex', flexShrink: 0, position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={groomName && brideName ? `${groomName} & ${brideName}` : 'Couple'}
              width={420}
              height={630}
              style={{ objectFit: 'cover', display: 'block' }}
            />
            {/* left-edge gradient blends photo into the template background */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: 100, height: '100%',
                background: `linear-gradient(to right, ${theme.gradientFrom}, transparent)`,
              }}
            />
          </div>
        )}
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Playfair', data: font, style: 'normal', weight: 600 }],
    },
  );
}
