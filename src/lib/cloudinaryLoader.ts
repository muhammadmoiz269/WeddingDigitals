'use client'

const TRANSFORM_RE = /\/upload\/(?:[a-z0-9_,]+\/)?(v\d+\/.*)/;

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src || !src.includes('res.cloudinary.com')) return src;
  if (!TRANSFORM_RE.test(src)) return src;
  const transforms = `f_auto,c_limit,w_${width},q_${quality ?? 'auto'}`;
  return src.replace(/\/upload\/(?:[a-z0-9_,]+\/)?/, `/upload/${transforms}/`);
}
