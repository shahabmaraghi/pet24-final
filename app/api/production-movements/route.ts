import { NextResponse } from "next/server";
import { withMongoRetry } from "@/lib/db";
import { requireAdmin } from "@/lib/api-helpers";
import ProductionMovement from "@/lib/models/ProductionMovement";
import { serializeProductionMovement, warehouseName } from "@/lib/store-production-movement";

function parseLines(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((line, index) => ({
      id: String(line?.id || index + 1),
      productId: String(line?.productId || "").trim(),
      productName: String(line?.productName || "").trim(),
      supplierId: String(line?.supplierId || "").trim(),
      supplierName: String(line?.supplierName || "").trim(),
      productionDate: String(line?.productionDate || "").trim(),
      expiryDate: String(line?.expiryDate || "").trim(),
      batchNumber: String(line?.batchNumber || "").trim(),
      stock: {
        pallet: Number(line?.stock?.pallet || 0),
        carton: Number(line?.stock?.carton || 0),
        pack: Number(line?.stock?.pack || 0),
        unit: Number(line?.stock?.unit || 0),
      },
      orderQuantity: Number(line?.orderQuantity || 0),
    }))
    .filter((line) => line.productId || line.productName);
}

function parseAttachments(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((file) => ({
      name: String(file?.name || "").trim(),
      size: Number(file?.size || 0),
      url: String(file?.url || "").trim(),
    }))
    .filter((file) => file.name);
}

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const items = await withMongoRetry(async () => ProductionMovement.find().sort({ createdAt: -1 }).limit(100));
    return NextResponse.json(items.map(serializeProductionMovement), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAdmin();
    if (error || !session) return error;
    const body = await req.json();
    const fromWarehouseId = String(body.fromWarehouseId || "").trim();
    const toWarehouseId = String(body.toWarehouseId || "").trim();
    if (!fromWarehouseId) return NextResponse.json({ error: "انبار مبدأ را انتخاب کنید." }, { status: 400 });
    if (!toWarehouseId) return NextResponse.json({ error: "انبار مقصد را انتخاب کنید." }, { status: 400 });
    if (fromWarehouseId === toWarehouseId) {
      return NextResponse.json({ error: "انبار مبدأ و مقصد نباید یکسان باشند." }, { status: 400 });
    }
    const outputs = parseLines(body.outputs);
    const inputs = parseLines(body.inputs);
    if (outputs.length === 0 && inputs.length === 0) {
      return NextResponse.json({ error: "حداقل یک قلم خروجی یا ورودی وارد کنید." }, { status: 400 });
    }
    const item = await withMongoRetry(async () =>
      ProductionMovement.create({
        fromWarehouseId,
        fromWarehouseName: warehouseName(fromWarehouseId),
        toWarehouseId,
        toWarehouseName: warehouseName(toWarehouseId),
        description: String(body.description || "").trim(),
        attachments: parseAttachments(body.attachments),
        outputs,
        inputs,
        createdBy: String(session.user.id || session.user.email || ""),
      })
    );
    return NextResponse.json(serializeProductionMovement(item), { status: 201 });
  } catch {
    return NextResponse.json({ error: "ذخیره انتقال تولید انجام نشد." }, { status: 500 });
  }
}
