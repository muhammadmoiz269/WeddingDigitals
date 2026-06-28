import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import connectToDatabase from '@/lib/mongodb';
import EInvitationModel from '@/lib/models/EInvitation';
import type { EInvitation } from '@/types';
import InvitePageClient from '@/components/invite/InvitePageClient';

// Always fetch live data — invitations are per-customer and change on every admin edit.
export const dynamic = 'force-dynamic';

// ─── Fetch (shared between generateMetadata and the page via React cache) ────

const fetchInvitation = cache(async (slug: string): Promise<EInvitation | null> => {
  try {
    await connectToDatabase();
    const doc = await EInvitationModel.findOne({ slug, status: 'published' }).lean();
    if (!doc) return null;
    // JSON round-trip strips Mongoose internals and converts ObjectId / Date to strings
    return JSON.parse(JSON.stringify(doc)) as EInvitation;
  } catch {
    return null;
  }
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await fetchInvitation(slug);

  if (!invitation) {
    return { title: { absolute: 'Invitation Not Found' } };
  }

  const { groom_name, bride_name } = invitation.couple;
  const title = `${groom_name} & ${bride_name} — Wedding Invitation`;

  return {
    title: { absolute: title },
    description: `You are cordially invited to attend the ${invitation.couple.event_title} of ${groom_name} and ${bride_name}.`,
    // Personal invitation pages must not be indexed — every slug is a private URL
    robots: { index: false, follow: false },
    // Per CLAUDE.md: every page must set its own canonical to avoid the root '/' default
    alternates: {
      canonical: `/invite/${slug}`,
      languages: {
        'en-PK': `/invite/${slug}`,
        'x-default': `/invite/${slug}`,
      },
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InvitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const invitation = await fetchInvitation(slug);

  if (!invitation) notFound();

  return <InvitePageClient invitation={invitation} />;
}
