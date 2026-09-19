import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Cart from "@/lib/models/Cart";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import { requireAuth } from "@/lib/api-helpers";
import { requestPayment } from "@/lib/zarinpal";
import { SHIPPING } from "@/lib/data";

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  await dbConnect();

  const body = await req.json(); // { shippingMethod, address }
  const cart = await Cart.findOne({ userId: session!.user.id }).populate("items.productId");
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "سبد خرید خالی است." }, { status: 400 });
  }
  if (!body.address?.name || !body.address?.phone || !body.address?.city || !body.address?.address) {
    return NextResponse.json({ error: "اطلاعات آدرس ناقص است." }, { status: 400 });
  }

  const shipping = SHIPPING.find((s) => s.id === body.shippingMethod) || SHIPPING[0];
  const items = cart.items.map((it: any) => ({
    productId: it.productId._id,
    name: it.productId.name,
    price: it.productId.price,
    qty: it.qty,
  }));
  const subtotal = items.reduce((sum: number, it: any) => sum + it.price * it.qty, 0);
  const total = subtotal + shipping.price;

  const order = await Order.create({
    userId: session!.user.id,
    items,
    shippingMethod: shipping.id,
    shippingPrice: shipping.price,
    address: body.address,
    total,
    status: "pending_payment",
  });

  const origin = new URL(req.url).origin;
  try {
    const payment = await requestPayment(total, `سفارش Pet24 #${order._id}`, `${origin}/api/checkout/verify?orderId=${order._id}`, body.address.phone);
    order.payment = { authority: payment.authority, refId: "" };
    await order.save();
    return NextResponse.json({ orderId: order._id, paymentUrl: payment.url });
  } catch (e: any) {
    order.status = "cancelled";
    await order.save();
    return NextResponse.json({ error: e.message || "خطا در اتصال به درگاه پرداخت." }, { status: 502 });
  }
}
