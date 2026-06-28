import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import connectToDatabase from '@/lib/mongodb';
import EInvitationModel from '@/lib/models/EInvitation';
import { cld } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const font = await readFile(join(process.cwd(), 'public/fonts/PlayfairDisplay-SemiBold.ttf'));

  let groomName = '';
  let brideName = '';
  let eventTitle = '';
  let dateStr = '';
  let imageUrl = '';

  try {
    await connectToDatabase();
    const doc = await EInvitationModel
      .findOne({ slug, status: 'published' }, 'couple media wedding_at')
      .lean();
    if (doc) {
      groomName   = doc.couple.groom_name;
      brideName   = doc.couple.bride_name;
      eventTitle  = doc.couple.event_title;
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

  const hasCouple   = !!(groomName && brideName);
  const hasPhoto    = !!imageUrl;
  const nameFontSz  = hasPhoto ? 62 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0C0A07',
          fontFamily: 'Playfair',
          position: 'relative',
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
              fontSize: 11,
              color: '#C9A96E',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            You are cordially invited
          </div>

          {/* Couple names */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {hasCouple ? (
              <>
                <div style={{ fontSize: nameFontSz, color: '#F5F0E8', lineHeight: 1.05 }}>
                  {groomName}
                </div>
                <div
                  style={{
                    fontSize: nameFontSz * 0.42,
                    color: '#C9A96E',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    letterSpacing: '0.12em',
                  }}
                >
                  &amp;
                </div>
                <div style={{ fontSize: nameFontSz, color: '#F5F0E8', lineHeight: 1.05 }}>
                  {brideName}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 68, color: '#F5F0E8', lineHeight: 1.1 }}>
                Wedding Invitation
              </div>
            )}
          </div>

          {/* Bottom footer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(eventTitle || dateStr) && (
              <div
                style={{
                  fontSize: 17,
                  color: '#4e7a5e',
                  letterSpacing: '0.06em',
                  lineHeight: 1.5,
                }}
              >
                {[eventTitle, dateStr].filter(Boolean).join(' · ')}
              </div>
            )}
            <div
              style={{
                fontSize: 15,
                color: '#C9A96E',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Shahi Bulawa · Karachi
            </div>
          </div>
        </div>

        {/* ── Right: couple photo ─────────────────────────────────────── */}
        {hasPhoto && (
          <div style={{ width: 420, height: 630, display: 'flex', flexShrink: 0, position: 'relative' }}>
            {/* Photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={hasCouple ? `${groomName} & ${brideName}` : 'Couple'}
              width={420}
              height={630}
              style={{ objectFit: 'cover', display: 'block' }}
            />
            {/* Left-edge gradient — blends photo into dark background */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: 120, height: '100%',
                background: 'linear-gradient(to right, #0C0A07, transparent)',
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
