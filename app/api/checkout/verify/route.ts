import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/lib/models/Order";
import Cart from "@/lib/models/Cart";
import { verifyPayment } from "@/lib/zarinpal";

// Zarinpal redirects the browser here with ?Authority=...&Status=OK|NOK
export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("Status");
  const authority = searchParams.get("Authority");
  const origin = new URL(req.url).origin;

  const order = await Order.findById(orderId);
  if (!order) return NextResponse.redirect(`${origin}/checkout?error=notfound`);

  if (status !== "OK") {
    order.status = "cancelled";
    await order.save();
    return NextResponse.redirect(`${origin}/checkout?error=cancelled`);
  }

  const result = await verifyPayment(order.total, authority || order.payment?.authority || "");
  if (result.ok) {
    order.status = "paid";
    order.payment = { authority: authority || "", refId: result.refId || "" };
    await order.save();
    await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });
    return NextResponse.redirect(`${origin}/checkout/success?orderId=${order._id}`);
  }

  order.status = "cancelled";
  await order.save();
  return NextResponse.redirect(`${origin}/checkout?error=payment_failed`);
}
