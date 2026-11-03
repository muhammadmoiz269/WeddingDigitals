export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-PK', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch (err) {
    console.error('[datetime] Failed to format date for iso:', iso, err);
    return '';
  }
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-PK', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch (err) {
    console.error('[datetime] Failed to format time for iso:', iso, err);
    return '';
  }
}
