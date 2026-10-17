import { NextResponse } from "next/server";
import { dbConnect, withMongoRetry } from "@/lib/db";
import { requireAdmin } from "@/lib/api-helpers";
import Product from "@/lib/models/Product";
import Order from "@/lib/models/Order";

const PAID_STATUSES = ["paid", "processing", "shipped", "delivered"];
const DAYS = 30;

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildEmptySeries(days: number) {
  const series: { date: string; label: string; sales: number; orders: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    series.push({
      date: dayKey(d),
      label: d.toLocaleDateString("fa-IR", { month: "short", day: "numeric" }),
      sales: 0,
      orders: 0,
    });
  }
  return series;
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await dbConnect();
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (DAYS - 1));

    const [productCount, lowStockCount, unavailableCount, orderStats, daily] = await withMongoRetry(async () =>
      Promise.all([
        Product.countDocuments({}).maxTimeMS(8000),
        Product.countDocuments({
          stock: { $lt: 5 },
          available: { $ne: false },
        }).maxTimeMS(8000),
        Product.countDocuments({ available: false }).maxTimeMS(8000),
        Order.aggregate([
          {
            $group: {
              _id: null,
              orderCount: { $sum: 1 },
              totalSales: {
                $sum: {
                  $cond: [
                    { $in: ["$status", PAID_STATUSES] },
                    { $ifNull: ["$total", 0] },
                    0,
                  ],
                },
              },
            },
          },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: since } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              orders: { $sum: 1 },
              sales: {
                $sum: {
                  $cond: [
                    { $in: ["$status", PAID_STATUSES] },
                    { $ifNull: ["$total", 0] },
                    0,
                  ],
                },
              },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ])
    );

    const stats = orderStats[0] || { orderCount: 0, totalSales: 0 };
    const byDay = new Map(
      (daily as { _id: string; orders: number; sales: number }[]).map((row) => [
        row._id,
        { orders: Number(row.orders || 0), sales: Number(row.sales || 0) },
      ])
    );
    const series = buildEmptySeries(DAYS).map((point) => {
      const hit = byDay.get(point.date);
      return hit ? { ...point, orders: hit.orders, sales: hit.sales } : point;
    });

    return NextResponse.json(
      {
        productCount,
        lowStockCount,
        unavailableCount,
        orderCount: Number(stats.orderCount || 0),
        totalSales: Number(stats.totalSales || 0),
        series,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("GET /api/admin/stats failed", err);
    return NextResponse.json(
      {
        productCount: 0,
        lowStockCount: 0,
        unavailableCount: 0,
        orderCount: 0,
        totalSales: 0,
        series: buildEmptySeries(DAYS),
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
