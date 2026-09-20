"use client";

import { fmt } from "@/lib/data";

const PAYMENTS: { id: number; date: string; amount: number; method: string; status: string }[] = [];

export default function AccountPaymentsPage() {
  return (
    <>
      <h1 className="mb-5 text-[22px] font-extrabold text-primary">پرداخت‌ها</h1>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-right font-semibold text-muted-foreground">تاریخ</th>
              <th className="p-3 text-right font-semibold text-muted-foreground">مبلغ</th>
              <th className="p-3 text-right font-semibold text-muted-foreground">روش</th>
              <th className="p-3 text-right font-semibold text-muted-foreground">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {PAYMENTS.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">پرداختی ثبت نشده است.</td></tr>
            ) : PAYMENTS.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.date}</td>
                <td className="p-3">{fmt(p.amount)}</td>
                <td className="p-3">{p.method}</td>
                <td className="p-3">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
