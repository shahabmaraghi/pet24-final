"use client";

import { fmt } from "@/lib/data";

const ORDERS: { id: string; date: string; itemsCount: number; total: number; status: string }[] = [];

function statusColor(status: string) {
  if (status === "تحویل شده") return "text-primary";
  if (status === "ارسال شده") return "text-[#2f5ea8]";
  if (status === "در انتظار پرداخت") return "text-[#c17d2f]";
  return "text-muted-foreground";
}

export default function AccountOrdersPage() {
  return (
    <>
      <h1 className="mb-5 text-[22px] font-extrabold text-primary">سفارشات</h1>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-right font-semibold text-muted-foreground">شماره</th>
              <th className="p-3 text-right font-semibold text-muted-foreground">تاریخ</th>
              <th className="p-3 text-right font-semibold text-muted-foreground">تعداد کالا</th>
              <th className="p-3 text-right font-semibold text-muted-foreground">مبلغ</th>
              <th className="p-3 text-right font-semibold text-muted-foreground">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">هنوز سفارشی ثبت نشده است.</td></tr>
            ) : ORDERS.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.id}</td>
                <td className="p-3">{o.date}</td>
                <td className="p-3">{o.itemsCount}</td>
                <td className="p-3">{fmt(o.total)}</td>
                <td className={`p-3 font-semibold ${statusColor(o.status)}`}>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
