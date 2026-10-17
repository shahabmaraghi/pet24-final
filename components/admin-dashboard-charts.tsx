"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmt } from "@/lib/data";

export type DashboardSeriesPoint = {
  date: string;
  label: string;
  sales: number;
  orders: number;
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h2 className="mb-4 text-[15px] font-extrabold text-primary">{title}</h2>
      <div className="h-64 w-full" dir="ltr">
        {children}
      </div>
    </div>
  );
}

export function AdminDashboardCharts({ series }: { series: DashboardSeriesPoint[] }) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <ChartCard title="نمودار فروش (۳۰ روز اخیر)">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={28} />
            <YAxis
              tick={{ fontSize: 11 }}
              width={56}
              tickFormatter={(v) => fmt(Number(v))}
            />
            <Tooltip
              formatter={(value) => [`${fmt(Number(value || 0))} تومان`, "فروش"]}
              labelFormatter={(label) => String(label)}
              contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--primary))"
              fill="url(#salesFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="نمودار سفارشات (۳۰ روز اخیر)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={28} />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
              width={40}
              tickFormatter={(v) => fmt(Number(v))}
            />
            <Tooltip
              formatter={(value) => [fmt(Number(value || 0)), "سفارش"]}
              labelFormatter={(label) => String(label)}
              contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
            />
            <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
