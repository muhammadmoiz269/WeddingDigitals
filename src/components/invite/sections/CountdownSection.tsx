'use client';

import { InvSection } from '../core/primitives/InvSection';
import { Parallax } from '../core/primitives/Parallax';
import { Divider } from '../core/primitives/Divider';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface Props {
  countdownHeading: string;
  weddingDate: string;
  timeLeft: CountdownTime;
  isPast: boolean;
}

export function CountdownSection({ countdownHeading, weddingDate, timeLeft, isPast }: Props) {
  return (
    <InvSection
      sideLeft={
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/assets/template-01/column-left-countdown.png" alt="" aria-hidden="true" className="inv-col-img" />
      }
      sideRight={
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/assets/template-01/column-right-countdown.png" alt="" aria-hidden="true" className="inv-col-img" />
      }
    >
      <Parallax speed={150}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 400,
          color: '#3a5542',
          textAlign: 'center',
          letterSpacing: '0.05em',
          margin: '0 0 0.5rem',
          lineHeight: 1.2,
        }}>
          {countdownHeading}
        </h2>
        <Divider />
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
          color: '#2C2C2C',
          textAlign: 'center',
          opacity: 0.55,
          letterSpacing: '0.06em',
          margin: '0 0 2.5rem',
        }}>
          Till {weddingDate}
        </p>
      </Parallax>
      <Parallax speed={150}>
        <div className="inv-countdown-outer">
          <div>
            {isPast ? (
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
                color: '#3a5542',
                textAlign: 'center',
                opacity: 0.8,
              }}>
                The big day has arrived
              </p>
            ) : (
              <div className="inv-countdown-units">
                {(
                  [
                    { value: timeLeft.days,    label: 'Days' },
                    { value: timeLeft.hours,   label: 'Hours' },
                    { value: timeLeft.minutes, label: 'Minutes' },
                    { value: timeLeft.seconds, label: 'Seconds' },
                  ] as const
                ).map(({ value, label }) => (
                  <div key={label} className="inv-countdown-unit">
                    <span className="inv-countdown-number" suppressHydrationWarning>
                      {String(value).padStart(2, '0')}
                    </span>
                    <span className="inv-countdown-timelabel">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Parallax>
    </InvSection>
  );
}
