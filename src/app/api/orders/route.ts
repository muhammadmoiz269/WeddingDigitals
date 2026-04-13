import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";

function generateOrderId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `PGM-${num}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = [
      "card_slug", "card_name", "quantity", "base_price", "total",
    ];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!body.customization?.groom_name || !body.customization?.bride_name) {
      return NextResponse.json(
        { success: false, error: "Customization details are required" },
        { status: 400 }
      );
    }

    if (!body.customer?.name || !body.customer?.whatsapp || !body.customer?.area) {
      return NextResponse.json(
        { success: false, error: "Customer details are required (name, whatsapp, area)" },
        { status: 400 }
      );
    }

    if (!body.payment?.method) {
      return NextResponse.json(
        { success: false, error: "Payment method is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Generate unique order ID (retry if collision)
    let orderId = generateOrderId();
    let retries = 5;
    while (retries > 0) {
      const existing = await Order.findOne({ order_id: orderId }).lean();
      if (!existing) break;
      orderId = generateOrderId();
      retries--;
    }

    const order = await Order.create({
      order_id: orderId,
      card_slug: body.card_slug,
      card_name: body.card_name,
      quantity: Number(body.quantity),
      base_price: Number(body.base_price),
      add_ons: Array.isArray(body.add_ons) ? body.add_ons : [],
      total: Number(body.total),
      customization: {
        template: body.customization.template || "custom",
        content: body.customization.content || "",
        groom_name: body.customization.groom_name,
        bride_name: body.customization.bride_name,
        date: body.customization.date || "",
        venue: body.customization.venue || "",
      },
      customer: {
        name: body.customer.name,
        whatsapp: body.customer.whatsapp,
        area: body.customer.area,
      },
      payment: {
        method: body.payment.method,
        amount_due: Number(body.payment.amount_due || body.total),
        receipt_url: body.payment.receipt_url || "",
        status: body.payment.receipt_url ? "confirmed" : "pending_payment",
      },
    });

    return NextResponse.json(
      { success: true, data: { order_id: order.order_id } },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating order:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// GET /api/orders — list all orders (for admin)
export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ created_at: -1 }).lean();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}
