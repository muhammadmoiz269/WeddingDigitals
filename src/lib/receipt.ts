/**
 * Client-side PDF receipt generator (jsPDF is dynamically imported so it only
 * loads when the customer actually downloads a receipt).
 */

import { formatPKR } from "@/lib/pricing";
import { WHATSAPP_DISPLAY } from "@/lib/constants";

export interface ReceiptOrder {
  order_id: string;
  card_name: string;
  quantity: number;
  base_price?: number;
  add_ons?: { name: string; price: number }[];
  subtotal_before_discount?: number;
  discount?: { source: "promo" | "quantity"; code?: string; amount: number };
  total: number;
  customization: {
    main_event: string;
    addon_events: { event_type: string; quantity: number; price_per_card?: number }[];
  };
  customer: { name: string; whatsapp: string; area: string };
  payment: { method: string; amount_due: number; status: string };
  created_at: string;
}

const GOLD: [number, number, number] = [201, 169, 110];
const DARK: [number, number, number] = [42, 32, 24];
const GRAY: [number, number, number] = [125, 110, 95];
const GREEN: [number, number, number] = [22, 130, 60];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function downloadReceipt(order: ReceiptOrder): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageW = 210;
  const margin = 20;
  const right = pageW - margin;
  let y = 16;

  // ── Logo (centered at the top) ──
  try {
    const logo = await loadImage("/images/logo.png");
    const h = 20;
    const w = (logo.width / logo.height) * h;
    doc.addImage(logo, "PNG", (pageW - w) / 2, y, w, h);
    y += h + 8;
  } catch {
    // Logo missing/unreadable — the text header below still identifies the brand
    y += 4;
  }

  // ── Brand header ──
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...GOLD);
  doc.text("Shahi Bulawa", pageW / 2, y, { align: "center" });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Premium Wedding Cards — Karachi", pageW / 2, y, { align: "center" });
  y += 7;

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(margin, y, right, y);
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("ORDER RECEIPT", pageW / 2, y, { align: "center", charSpace: 1 });
  y += 10;

  // ── Order + customer meta ──
  const placedOn = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GRAY);
  doc.text("ORDER", margin, y);
  doc.text("CUSTOMER", 120, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(`Order ID: ${order.order_id}`, margin, y);
  doc.text(order.customer.name, 120, y);
  y += 5;
  doc.text(`Date: ${placedOn}`, margin, y);
  doc.text(`WhatsApp: ${order.customer.whatsapp}`, 120, y);
  y += 5;
  doc.text(`Delivery: ${order.customer.area}, Karachi`, 120, y);
  y += 10;

  // ── Items table ──
  const colQty = 128;
  const colPrice = 158;
  const colAmount = right;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("ITEM", margin, y);
  doc.text("QTY", colQty, y, { align: "right" });
  doc.text("PRICE", colPrice, y, { align: "right" });
  doc.text("AMOUNT", colAmount, y, { align: "right" });
  y += 2;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(margin, y, right, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);

  const itemRow = (name: string, qty: number, price: number, amount: number) => {
    const lines = doc.splitTextToSize(name, 95);
    doc.text(lines, margin, y);
    doc.text(String(qty), colQty, y, { align: "right" });
    doc.text(formatPKR(price), colPrice, y, { align: "right" });
    doc.text(formatPKR(amount), colAmount, y, { align: "right" });
    y += lines.length * 4.5 + 2.5;
  };

  const basePrice = order.base_price ?? 0;
  itemRow(
    `${order.card_name} (${order.customization.main_event})`,
    order.quantity,
    basePrice,
    basePrice * order.quantity
  );
  for (const addon of order.add_ons ?? []) {
    itemRow(`Add-on: ${addon.name}`, order.quantity, addon.price, addon.price * order.quantity);
  }
  for (const evt of order.customization.addon_events ?? []) {
    const ppc = evt.price_per_card ?? 0;
    itemRow(`${evt.event_type} — Inner Card`, evt.quantity, ppc, ppc * evt.quantity);
  }

  y += 1;
  doc.setDrawColor(...GOLD);
  doc.line(margin, y, right, y);
  y += 7;

  // ── Totals ──
  const totalRow = (
    label: string,
    value: string,
    opts: { bold?: boolean; color?: [number, number, number]; size?: number } = {}
  ) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size ?? 9.5);
    doc.setTextColor(...(opts.color ?? DARK));
    doc.text(label, 120, y);
    doc.text(value, colAmount, y, { align: "right" });
    y += 6;
  };

  const discountAmount = order.discount?.amount ?? 0;
  const subtotal = order.subtotal_before_discount ?? order.total + discountAmount;

  totalRow("Subtotal", formatPKR(subtotal));
  if (order.discount && discountAmount > 0) {
    const label =
      order.discount.source === "promo"
        ? `Discount (${order.discount.code})`
        : "Bulk Discount";
    totalRow(label, `- ${formatPKR(discountAmount)}`, { color: GREEN });
  }
  totalRow("Grand Total", formatPKR(order.total), { bold: true, size: 11 });
  y += 1;

  const isDeposit = order.payment.method === "deposit";
  totalRow("Payment Preference", isDeposit ? "50% Deposit" : "Full Payment", { color: GRAY });
  totalRow(isDeposit ? "Advance Due" : "Amount Due", formatPKR(order.payment.amount_due));
  if (isDeposit) {
    totalRow("Balance Before Delivery", formatPKR(order.total - order.payment.amount_due));
  }

  // ── Payment status note ──
  y += 4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  const note =
    isDeposit
      ? "Note: The rest 50% payment should be cleared before delivery."
      : "Thank you for choosing Shahi Bulawa, looking forward to serve you again";
  doc.text(note, margin, y);

  // ── Footer ──
  const footerY = 280;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 8, right, footerY - 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text("Thank you for ordering with Shahi Bulawa!", pageW / 2, footerY - 2, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`shahibulawa.com  ·  WhatsApp: ${WHATSAPP_DISPLAY}`, pageW / 2, footerY + 3, { align: "center" });

  doc.save(`Shahi-Bulawa-Receipt-${order.order_id}.pdf`);
}
