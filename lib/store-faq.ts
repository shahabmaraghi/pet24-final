export type StoreFaq = {
  id: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
};

export const SEED_FAQS: Omit<StoreFaq, "id">[] = [
  {
    question: "هزینه ارسال چقدر است؟",
    answer: "سفارش‌های داخل تهران معمولاً با هزینه کم ارسال می‌شوند و برای خریدهای بالاتر از مبلغ مشخص، ارسال رایگان است. هزینه سایر شهرها هنگام ثبت سفارش محاسبه می‌شود.",
    order: 1,
    active: true,
  },
  {
    question: "چقدر طول می‌کشد تا سفارشم برسد؟",
    answer: "تحویل در تهران معمولاً ۱ روز کاری و در سایر شهرها ۱ تا ۳ روز کاری است.",
    order: 2,
    active: true,
  },
  {
    question: "آیا محصولات اصل هستند؟",
    answer: "بله. تمام کالاها از تامین‌کنندگان معتبر تهیه می‌شوند و با ضمانت اصالت به دست شما می‌رسند.",
    order: 3,
    active: true,
  },
  {
    question: "امکان مرجوعی کالا وجود دارد؟",
    answer: "در صورت مغایرت یا نقص کالا، تا ۷ روز پس از دریافت می‌توانید با پشتیبانی هماهنگ کنید و کالا را مرجوع نمایید.",
    order: 4,
    active: true,
  },
  {
    question: "چطور سفارش ثبت کنم؟",
    answer: "محصول را به سبد خرید اضافه کنید، وارد حساب کاربری شوید و پرداخت را از طریق درگاه بانکی تکمیل کنید.",
    order: 5,
    active: true,
  },
];

export function serializeFaq(doc: any): StoreFaq {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(obj._id ?? obj.id),
    question: String(obj.question ?? "").trim(),
    answer: String(obj.answer ?? "").trim(),
    order: Number(obj.order || 0),
    active: obj.active !== false,
  };
}

export function faqUpdateFromBody(body: Record<string, unknown>) {
  const update: Record<string, unknown> = {};
  if (typeof body.question === "string") update.question = body.question.trim();
  if (typeof body.answer === "string") update.answer = body.answer.trim();
  if (body.order !== undefined) update.order = Number(body.order) || 0;
  if (typeof body.active === "boolean") update.active = body.active;
  return update;
}
