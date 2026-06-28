'use client';

import { InvSection } from '../core/primitives/InvSection';
import { Parallax } from '../core/primitives/Parallax';

interface Props {
  imageUrl: string;
  groomName: string;
  brideName: string;
}

export function CoverImageSection({ imageUrl, groomName, brideName }: Props) {
  return (
    <InvSection>
      <Parallax speed={150}>
        <div className="inv-media-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${groomName} & ${brideName}`}
            style={{ width: '100%', maxHeight: 580, objectFit: 'cover', borderRadius: 10, display: 'block' }}
          />
        </div>
      </Parallax>
    </InvSection>
  );
}
