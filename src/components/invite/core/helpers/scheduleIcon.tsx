export function getScheduleIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('nikkah') || t.includes('nikah') || t.includes('ceremony')) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>
  );
  if (t.includes('dinner') || t.includes('walima') || t.includes('valima') || t.includes('lunch') || t.includes('food')) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>
  );
  if (t.includes('baraat') || t.includes('barat') || t.includes('procession')) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="9" width="15" height="9" rx="2"/><path d="M16 13h4l3 3v-3h1V9h-8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  );
  if (t.includes('mehndi') || t.includes('henna')) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22a9 9 0 0 0 0-18"/><path d="M12 13a4 4 0 0 0 0-8"/><circle cx="12" cy="9" r="1" fill="currentColor"/></svg>
  );
  if (t.includes('music') || t.includes('dance') || t.includes('qawwali')) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
  );
  if (t.includes('photo') || t.includes('picture') || t.includes('shoot')) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/></svg>
  );
  if (t.includes('gathering') || t.includes('arrival') || t.includes('welcome') || t.includes('guest')) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
  if (t.includes('end') || t.includes('farewell') || t.includes('conclude') || t.includes('close') || t.includes('reception')) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
  );
}
