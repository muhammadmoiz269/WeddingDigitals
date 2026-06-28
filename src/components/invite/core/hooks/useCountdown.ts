'use client';

import { useState, useEffect } from 'react';

export function calcTimeLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function useCountdown(iso: string) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(iso));
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(iso)), 1000);
    return () => clearInterval(id);
  }, [iso]);
  return timeLeft;
}
