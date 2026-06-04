// ─── Type declarations ───────────────────────────────────────────────────────

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function gtagEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}

function fbqEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', eventName, params);
}

// ─── Events ──────────────────────────────────────────────────────────────────

/**
 * ViewContent — user views a product page.
 * Fire on the product detail page mount.
 */
export function viewContent(card: {
  slug: string;
  name: string;
  category: string;
  base_price: number;
}) {
  gtagEvent('view_item', {
    item_id: card.slug,
    item_name: card.name,
    item_category: card.category,
    value: card.base_price,
    currency: 'PKR',
  });

  fbqEvent('ViewContent', {
    content_ids: [card.slug],
    content_name: card.name,
    content_category: card.category,
    content_type: 'product',
    value: card.base_price,
    currency: 'PKR',
  });
}

/**
 * InitiateCheckout — user lands on the checkout page.
 * Fire once on checkout page load.
 */
export function beginCheckout(cardSlug: string, quantity: number, value: number) {
  gtagEvent('begin_checkout', { card_code: cardSlug, quantity, value, currency: 'PKR' });

  fbqEvent('InitiateCheckout', {
    content_ids: [cardSlug],
    num_items: quantity,
    value,
    currency: 'PKR',
  });
}

/**
 * Purchase — order placed successfully.
 * Fire after API confirms the order with the returned order_id.
 */
export function purchase(orderId: string, cardSlug: string, quantity: number, value: number) {
  gtagEvent('purchase', {
    transaction_id: orderId,
    card_code: cardSlug,
    quantity,
    value,
    currency: 'PKR',
  });

  fbqEvent('Purchase', {
    content_ids: [cardSlug],
    num_items: quantity,
    value,
    currency: 'PKR',
    order_id: orderId,
  });
}

/**
 * Lead — user clicks the WhatsApp button (intent to contact).
 */
export function whatsappClick(source: string, productSlug?: string) {
  gtagEvent('whatsapp_click', { source, product_slug: productSlug });

  fbqEvent('Lead', {
    content_name: source,
    content_category: 'whatsapp',
    ...(productSlug ? { content_ids: [productSlug] } : {}),
  });
}

/**
 * GenerateLead — alias kept for backward compat.
 */
export function generateLead(orderId: string, value: number) {
  gtagEvent('generate_lead', { order_id: orderId, value, currency: 'PKR' });
}
