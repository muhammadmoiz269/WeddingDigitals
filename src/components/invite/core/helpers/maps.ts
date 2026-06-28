export function embedToDirectionsUrl(embedUrl: string): string {
  const cidMatch = embedUrl.match(/!1s0x[0-9a-f]+(?:%3A|:)0x([0-9a-f]+)/i);
  if (cidMatch) {
    const cid = BigInt('0x' + cidMatch[1]).toString();
    return `https://maps.google.com/?cid=${cid}`;
  }
  const lat = embedUrl.match(/!3d(-?\d+\.\d+)/)?.[1];
  const lng = embedUrl.match(/!2d(-?\d+\.\d+)/)?.[1];
  if (lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  return embedUrl.replace('google.com/maps/embed', 'google.com/maps');
}
