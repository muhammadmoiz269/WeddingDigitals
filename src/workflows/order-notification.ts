import { FatalError } from "workflow";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  confirmed: "Confirmed",
  in_production: "In Production",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  full: "Full Payment",
  deposit: "Deposit (50%)",
};

export interface OrderNotifyPayload {
  order_id: string;
  card_name: string;
  quantity: number;
  total: number;
  main_event: string;
  customer_name: string;
  customer_whatsapp: string;
  customer_city: string;
  customer_address: string;
  payment_method: string;
  amount_due: number;
  payment_status: string;
}

export async function sendOrderNotification(order: OrderNotifyPayload) {
  "use workflow";

  await emailOrderNotification(order);
}

async function emailOrderNotification(order: OrderNotifyPayload) {
  "use step";

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.NOTIFY_EMAIL_TO;
  const cc = (process.env.NOTIFY_EMAIL_CC ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!apiKey || !from || !to) {
    throw new FatalError(
      "Missing RESEND_API_KEY, RESEND_FROM, or NOTIFY_EMAIL_TO env vars"
    );
  }

  const subject = `🎉 New Order Received — ${order.order_id} (${order.quantity} cards)`;

  const waNumber = order.customer_whatsapp.replace(/[^0-9]/g, '').replace(/^0/, '92');
  const waLink = `https://wa.me/${waNumber}`;

  const html = `
<div style="font-family:sans-serif;font-size:14px;color:#111;max-width:520px">

  <h2 style="margin:0 0 16px">🎉 New Order — ${order.order_id}</h2>

  <!-- Customer card -->
  <div style="background:#f5f5f5;border-radius:8px;padding:16px 20px;margin-bottom:24px">
    <div style="font-size:18px;font-weight:600;margin-bottom:4px">${order.customer_name}</div>
    <div style="margin-bottom:4px">
      <a href="${waLink}" style="color:#25D366;font-weight:500;text-decoration:none">📱 ${order.customer_whatsapp}</a>
    </div>
    <div style="color:#555">${order.customer_city}${order.customer_address ? ` · ${order.customer_address}` : ''}</div>
  </div>

  <!-- Order details -->
  <table style="border-collapse:collapse;width:100%">
    <tr><td style="padding:5px 16px 5px 0;color:#555;white-space:nowrap">Order ID</td><td><strong>${order.order_id}</strong></td></tr>
    <tr><td style="padding:5px 16px 5px 0;color:#555;white-space:nowrap">Card</td><td>${order.card_name}</td></tr>
    <tr><td style="padding:5px 16px 5px 0;color:#555;white-space:nowrap">Event</td><td>${order.main_event}</td></tr>
    <tr><td style="padding:5px 16px 5px 0;color:#555;white-space:nowrap">Quantity</td><td>${order.quantity}</td></tr>
    <tr><td style="padding:5px 16px 5px 0;color:#555;white-space:nowrap">Total</td><td><strong>PKR ${order.total.toLocaleString()}</strong></td></tr>
    <tr><td style="padding:5px 16px 5px 0;color:#555;white-space:nowrap">Amount Due</td><td>PKR ${order.amount_due.toLocaleString()}</td></tr>
    <tr><td style="padding:5px 16px 5px 0;color:#555;white-space:nowrap">Payment</td><td>${PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method} — ${PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}</td></tr>
  </table>

</div>
`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, ...(cc.length ? { cc } : {}) }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
}
