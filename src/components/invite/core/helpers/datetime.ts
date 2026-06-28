export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-PK', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return ''; }
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-PK', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch { return ''; }
}
