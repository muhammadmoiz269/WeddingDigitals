// Strips any existing transform segment before injecting new transforms — idempotent.
// Cloudinary upload widget may already insert transforms; double-stacking wastes bytes.
const TRANSFORM_RE = /\/upload\/(?:[a-z0-9_,]+\/)?(v\d+\/.*)/;

export function cld(url: string, transforms = 'f_auto,q_auto'): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const match = url.match(TRANSFORM_RE);
  if (!match) return url;
  return url.replace(/\/upload\/(?:[a-z0-9_,]+\/)?/, `/upload/${transforms}/`);
}
