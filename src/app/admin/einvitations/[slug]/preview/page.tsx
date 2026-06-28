'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import InvitePageClient from '@/components/invite/InvitePageClient';
import type { EInvitation } from '@/types';

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0807', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(58,85,66,0.15)', borderTopColor: '#3a5542', borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params.slug as string;

  const [invitation, setInvitation] = useState<EInvitation | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    fetch('/api/auth/check').then(r => {
      if (r.status === 401) router.replace('/admin/login');
    });
  }, [router]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/einvitations/${slug}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setInvitation(json.data);
        else setError(json.error || 'Not found');
      })
      .catch(() => setError('Failed to load invitation'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Spinner />;

  if (error || !invitation) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0807', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontFamily: 'inherit', flexDirection: 'column', gap: '1rem' }}>
        <p>{error || 'Invitation not found'}</p>
        <button onClick={() => router.push('/admin')} style={{ background: 'none', border: '1px solid rgba(58,85,66,0.3)', color: '#3a5542', padding: '0.45rem 1rem', borderRadius: 7, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
          Back to admin
        </button>
      </div>
    );
  }

  const isPublished = invitation.status === 'published';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0A0807' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 9999,
        background: 'rgba(10,8,7,0.96)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(58,85,66,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem', gap: '0.75rem', minHeight: 44, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
          <button onClick={() => router.push('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: '1px solid rgba(58,85,66,0.25)', color: '#a09080', padding: '0.3rem 0.65rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7-7" /></svg>
            Admin
          </button>
          <span style={{ color: 'rgba(58,85,66,0.3)', fontSize: '0.75rem' }}>|</span>
          <span style={{ fontSize: '0.72rem', color: '#a09080', letterSpacing: '0.08em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '40vw' }}>
            {invitation.couple.groom_name} &amp; {invitation.couple.bride_name}
          </span>
          <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.55rem', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap', background: isPublished ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.1)', color: isPublished ? '#4ade80' : '#fbbf24', border: `1px solid ${isPublished ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)'}` }}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button onClick={() => router.push(`/admin/einvitations/${slug}/edit`)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: '1px solid rgba(58,85,66,0.25)', color: '#a09080', padding: '0.3rem 0.65rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Edit
          </button>
          {isPublished && (
            <a href={`/invite/${slug}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#3a5542', border: 'none', color: '#fff', padding: '0.3rem 0.75rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: 600 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              Open Live
            </a>
          )}
        </div>
      </div>

      {/* ── Invitation preview ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <InvitePageClient invitation={invitation} />
      </div>
    </div>
  );
}
