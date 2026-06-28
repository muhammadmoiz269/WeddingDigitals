export function normalizeWhatsApp(number: string): string {
  const digits = number.replace(/\D/g, '');
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return '92' + digits.slice(1);
  return '92' + digits;
}
