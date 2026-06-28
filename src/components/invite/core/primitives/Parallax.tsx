'use client';

import { useContext } from 'react';
import { motion, useTransform } from 'framer-motion';
import { SectionProgress } from '../SectionProgress';

export function Parallax({
  speed = 80,
  fade = true,
  children,
  style,
}: {
  speed?: number;
  fade?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const progress = useContext(SectionProgress)!;
  const y       = useTransform(progress, [0, 0.5, 1], [speed, 0, -speed]);
  const opacity = useTransform(progress, [0, 0.18, 0.82, 1], [0, 1, 1, 0]);
  return (
    <motion.div style={{ y, ...(fade ? { opacity } : {}), ...style }}>
      {children}
    </motion.div>
  );
}
