'use client';

import { motion } from 'framer-motion';

export function PetalsOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8, ease: 'easeInOut' }}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10, userSelect: 'none' }}
    >
      {([
        { dur:'14s', delay:'-2s',  scale:0.65, opacity:0.55, drift:'60px',  left:'3%',  shape:'a' },
        { dur:'19s', delay:'-10s', scale:0.55, opacity:0.45, drift:'100px', left:'8%',  shape:'b' },
        { dur:'12s', delay:'-5s',  scale:0.75, opacity:0.60, drift:'50px',  left:'13%', shape:'a' },
        { dur:'22s', delay:'-14s', scale:0.50, opacity:0.50, drift:'130px', left:'18%', shape:'b' },
        { dur:'16s', delay:'-8s',  scale:0.70, opacity:0.55, drift:'80px',  left:'23%', shape:'a' },
        { dur:'20s', delay:'-1s',  scale:0.60, opacity:0.45, drift:'90px',  left:'28%', shape:'b' },
        { dur:'15s', delay:'-11s', scale:0.65, opacity:0.50, drift:'110px', left:'33%', shape:'a' },
        { dur:'24s', delay:'-7s',  scale:0.45, opacity:0.40, drift:'150px', left:'38%', shape:'b' },
        { dur:'13s', delay:'-4s',  scale:0.80, opacity:0.60, drift:'70px',  left:'43%', shape:'a' },
        { dur:'21s', delay:'-16s', scale:0.55, opacity:0.45, drift:'120px', left:'48%', shape:'b' },
        { dur:'17s', delay:'-3s',  scale:0.70, opacity:0.55, drift:'90px',  left:'53%', shape:'a' },
        { dur:'23s', delay:'-9s',  scale:0.50, opacity:0.45, drift:'140px', left:'58%', shape:'b' },
        { dur:'15s', delay:'-13s', scale:0.65, opacity:0.50, drift:'100px', left:'63%', shape:'a' },
        { dur:'18s', delay:'-6s',  scale:0.60, opacity:0.40, drift:'80px',  left:'68%', shape:'b' },
        { dur:'14s', delay:'-2s',  scale:0.75, opacity:0.55, drift:'70px',  left:'73%', shape:'a' },
        { dur:'20s', delay:'-11s', scale:0.50, opacity:0.45, drift:'110px', left:'78%', shape:'b' },
        { dur:'16s', delay:'-5s',  scale:0.70, opacity:0.50, drift:'90px',  left:'83%', shape:'a' },
        { dur:'25s', delay:'-3s',  scale:0.40, opacity:0.40, drift:'160px', left:'88%', shape:'b' },
        { dur:'17s', delay:'-9s',  scale:0.65, opacity:0.50, drift:'100px', left:'93%', shape:'a' },
        { dur:'11s', delay:'-7s',  scale:0.72, opacity:0.52, drift:'85px',  left:'98%', shape:'b' },
      ] as { dur:string; delay:string; scale:number; opacity:number; drift:string; left:string; shape:string }[]).map((p, i) => (
        <div
          key={i}
          className="inv-petal"
          style={{
            position: 'absolute',
            left: p.left,
            top: 0,
            '--pd':   p.dur,
            '--pdel': p.delay,
            '--ps':   p.scale,
            '--po':   p.opacity,
            '--pdr':  p.drift,
          } as React.CSSProperties}
        >
          <div className="inv-petal-inner">
            {p.shape === 'a' ? (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="#3a5542">
                <path d="M12,2 C18,4 20,10 16,16 C12,21 7,20 6,14 C5,8 8,4 12,2 Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="#3a5542">
                <path d="M12,2 C17,6 19,13 12,22 C5,13 7,6 12,2 Z" />
              </svg>
            )}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
