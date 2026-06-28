export function playWASound() {
  const audio = new Audio('/assets/wa-receive.mp3');
  audio.volume = 0.8;
  audio.play().catch(() => {
    try {
      const ctx  = new AudioContext();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      const t = ctx.currentTime;
      osc.frequency.setValueAtTime(1050, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.07);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch { /* audio not supported */ }
  });
}
