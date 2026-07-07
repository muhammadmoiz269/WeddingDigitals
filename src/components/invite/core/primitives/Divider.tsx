'use client';

export function Divider({ color = '#3a5542' }: { color?: string }) {
  return (
    <div style={{
      width: 72,
      height: 1,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      margin: '1.25rem auto',
      flexShrink: 0,
    }} />
  );
}
