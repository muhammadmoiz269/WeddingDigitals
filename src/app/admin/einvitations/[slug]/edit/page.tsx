'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import EInviteForm from '../../EInviteForm';
import { EInvitation } from '@/types';

export default function EditEInvitePage() {
  const params = useParams();
  const slug   = params.slug as string;

  const [invitation, setInvitation] = useState<Partial<EInvitation> | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0807', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(201,169,110,0.2)', borderTopColor: '#C9A96E', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0807', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontFamily: 'inherit' }}>
        {error || 'Invitation not found'}
      </div>
    );
  }

  return <EInviteForm initialData={invitation} />;
}
