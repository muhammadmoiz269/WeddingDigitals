declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}

export function whatsappClick(source: string, productSlug?: string) {
  trackEvent('whatsapp_click', { source, product_slug: productSlug });
}

export function beginCheckout(cardCode: string, quantity: number, value: number) {
  trackEvent('begin_checkout', { card_code: cardCode, quantity, value, currency: 'PKR' });
}

export function generateLead(orderId: string, value: number) {
  trackEvent('generate_lead', { order_id: orderId, value, currency: 'PKR' });
}
