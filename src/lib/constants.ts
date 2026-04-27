/**
 * Central place for site-wide constants.
 * Change the phone number here and it will propagate everywhere.
 */

// International format (without +) for WhatsApp API links
export const WHATSAPP_NUMBER = '923443457239';

// Display-friendly format shown on the website
export const WHATSAPP_DISPLAY = '+92 344 345 7239';

// Pre-built WhatsApp base URL
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/** Build a WhatsApp chat link with an optional pre-filled message. */
export function getWhatsAppChatLink(message?: string): string {
  if (message) {
    return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
  }
  return WHATSAPP_BASE_URL;
}
