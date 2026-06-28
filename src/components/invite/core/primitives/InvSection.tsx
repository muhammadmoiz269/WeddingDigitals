'use client';

import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import { SectionProgress } from '../SectionProgress';
import { useScroller } from '../ScrollerContext';

export function InvSection({
  children,
  innerClass = '',
  sideLeft,
  sideRight,
}: {
  children: React.ReactNode;
  innerClass?: string;
  sideLeft?: React.ReactNode;
  sideRight?: React.ReactNode;
}) {
  const scrollRef  = useScroller();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: scrollRef as React.RefObject<HTMLElement>,
    offset: ['start end', 'end start'],
  });

  return (
    <SectionProgress.Provider value={scrollYProgress}>
      <section
        ref={sectionRef}
        className="inv-section"
        style={{ position: 'relative' }}
      >
        {sideLeft && (
          <div className="inv-side-left">
            {sideLeft}
          </div>
        )}
        {sideRight && (
          <div className="inv-side-right">
            {sideRight}
          </div>
        )}
        <div className={`inv-container ${innerClass}`.trim()} style={{ position: 'relative', zIndex: 2 }}>
          {children}
        </div>
      </section>
    </SectionProgress.Provider>
  );
}
