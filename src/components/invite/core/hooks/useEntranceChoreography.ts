'use client';

import { useState, useEffect } from 'react';
import { useAnimation } from 'framer-motion';

type AnimCtrl = ReturnType<typeof useAnimation>;

export interface EntranceChoreography {
  leftCurtainCtrl:   AnimCtrl;
  rightCurtainCtrl:  AnimCtrl;
  centerCurtainCtrl: AnimCtrl;
  textVisible:   boolean;
  petalsVisible: boolean;
}

export function useEntranceChoreography(): EntranceChoreography {
  const leftCurtainCtrl   = useAnimation();
  const rightCurtainCtrl  = useAnimation();
  const centerCurtainCtrl = useAnimation();
  const [textVisible, setTextVisible]     = useState(false);
  const [petalsVisible, setPetalsVisible] = useState(false);

  useEffect(() => {
    if (!textVisible) return;
    // Last text element animates at 1.6 s delay + ~0.7 s duration ≈ 2.3 s total.
    // Wait 2.2 s after text mounts before showing petals.
    const t = setTimeout(() => setPetalsVisible(true), 2200);
    return () => clearTimeout(t);
  }, [textVisible]);

  useEffect(() => {
    // Snap side curtains to center before anything is visible
    const hw = window.innerWidth * 0.50;
    leftCurtainCtrl.set({ x: hw });
    rightCurtainCtrl.set({ x: -hw });

    // Fires 2.2 s into the side-curtain animation (400 ms startup + 2200 ms),
    // overlapping the final stretch so center curtain drops while sides still move.
    const centerTimer = setTimeout(() => {
      centerCurtainCtrl.start({
        y: '0%',
        transition: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
      }).then(() => {
        setTextVisible(true);
        centerCurtainCtrl.start({
          rotate: [0, 0.5, -0.3, 0.6, 0],
          transition: { duration: 5.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 0.3 },
        });
      });
    }, 400 + 1000);

    const timer = setTimeout(async () => {
      await Promise.all([
        leftCurtainCtrl.start({
          x: 0,
          transition: { duration: 2.6, ease: [0.4, 0, 0.2, 1] },
        }),
        rightCurtainCtrl.start({
          x: 0,
          transition: { duration: 2.6, ease: [0.4, 0, 0.2, 1] },
        }),
      ]);

      leftCurtainCtrl.start({
        rotate: [0, 1.2, 0.4, 1.6, 0],
        transition: { duration: 5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
      });
      rightCurtainCtrl.start({
        rotate: [0, -1.4, -0.3, -1.8, 0],
        transition: { duration: 4.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 0.6 },
      });
    }, 400);

    return () => { clearTimeout(timer); clearTimeout(centerTimer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { leftCurtainCtrl, rightCurtainCtrl, centerCurtainCtrl, textVisible, petalsVisible };
}
