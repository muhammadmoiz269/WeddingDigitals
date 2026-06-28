'use client';

import { InvSection } from '../core/primitives/InvSection';
import { Parallax } from '../core/primitives/Parallax';

interface Props {
  videoUrl: string;
}

export function CoverVideoSection({ videoUrl }: Props) {
  return (
    <InvSection>
      <Parallax speed={150}>
        <div className="inv-media-wrap">
          <video
            src={videoUrl}
            controls playsInline
            style={{ width: '100%', borderRadius: 10, display: 'block', background: '#000' }}
          />
        </div>
      </Parallax>
    </InvSection>
  );
}
