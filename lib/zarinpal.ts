const SANDBOX = process.env.ZARINPAL_SANDBOX !== "false";
const BASE = SANDBOX ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
const GATEWAY = SANDBOX ? "https://sandbox.zarinpal.com/pg/StartPay" : "https://www.zarinpal.com/pg/StartPay";

export async function requestPayment(amount: number, description: string, callbackUrl: string, mobile?: string) {
  const res = await fetch(`${BASE}/pg/v4/payment/request.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount,
      description,
      callback_url: callbackUrl,
      metadata: mobile ? { mobile } : undefined,
    }),
  });
  const data = await res.json();
  if (data?.data?.code !== 100) throw new Error(data?.errors?.message || "خطا در اتصال به درگاه پرداخت");
  return { authority: data.data.authority as string, url: `${GATEWAY}/${data.data.authority}` };
}

export async function verifyPayment(amount: number, authority: string) {
  const res = await fetch(`${BASE}/pg/v4/payment/verify.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchant_id: process.env.ZARINPAL_MERCHANT_ID, amount, authority }),
  });
  const data = await res.json();
  const ok = data?.data?.code === 100 || data?.data?.code === 101;
  return { ok, refId: data?.data?.ref_id as string | undefined, raw: data };
}
