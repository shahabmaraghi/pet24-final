export const WAREHOUSES = [
  { id: "raw", name: "انبار مواد اولیه" },
  { id: "wip", name: "انبار تولید" },
  { id: "finished", name: "انبار محصول نهایی" },
  { id: "internal", name: "انبار داخلی" },
  { id: "scrap", name: "انبار ضایعات" },
] as const;

export const SUPPLIERS = [
  { id: "s1", name: "تامین‌کننده نمونه ۱" },
  { id: "s2", name: "تامین‌کننده نمونه ۲" },
  { id: "s3", name: "گروه صنعتی لینا" },
] as const;

export type StockUnits = {
  pallet: number;
  carton: number;
  pack: number;
  unit: number;
};

export type MovementLine = {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  productionDate: string;
  expiryDate: string;
  batchNumber: string;
  stock: StockUnits;
  orderQuantity: number;
};

export type MovementAttachment = {
  name: string;
  size: number;
  url: string;
};

export type StoreProductionMovement = {
  id: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  description: string;
  attachments: MovementAttachment[];
  outputs: MovementLine[];
  inputs: MovementLine[];
  createdAt: string;
};

export function warehouseName(id: string) {
  return WAREHOUSES.find((item) => item.id === id)?.name || id;
}

export function supplierName(id: string) {
  return SUPPLIERS.find((item) => item.id === id)?.name || id;
}

export function emptyStock(): StockUnits {
  return { pallet: 0, carton: 0, pack: 0, unit: 0 };
}

export function emptyLine(): MovementLine {
  return {
    id: crypto.randomUUID(),
    productId: "",
    productName: "",
    supplierId: "",
    supplierName: "",
    productionDate: "",
    expiryDate: "",
    batchNumber: "",
    stock: emptyStock(),
    orderQuantity: 0,
  };
}

function mapLine(line: any, index: number): MovementLine {
  return {
    id: String(line?.id || `${index}`),
    productId: String(line?.productId || ""),
    productName: String(line?.productName || ""),
    supplierId: String(line?.supplierId || ""),
    supplierName: String(line?.supplierName || ""),
    productionDate: String(line?.productionDate || ""),
    expiryDate: String(line?.expiryDate || ""),
    batchNumber: String(line?.batchNumber || ""),
    stock: {
      pallet: Number(line?.stock?.pallet || 0),
      carton: Number(line?.stock?.carton || 0),
      pack: Number(line?.stock?.pack || 0),
      unit: Number(line?.stock?.unit || 0),
    },
    orderQuantity: Number(line?.orderQuantity || 0),
  };
}

export function serializeProductionMovement(doc: any): StoreProductionMovement {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(obj._id ?? obj.id),
    fromWarehouseId: String(obj.fromWarehouseId || ""),
    fromWarehouseName: String(obj.fromWarehouseName || warehouseName(String(obj.fromWarehouseId || ""))),
    toWarehouseId: String(obj.toWarehouseId || ""),
    toWarehouseName: String(obj.toWarehouseName || warehouseName(String(obj.toWarehouseId || ""))),
    description: String(obj.description || ""),
    attachments: Array.isArray(obj.attachments)
      ? obj.attachments.map((file: any) => ({
          name: String(file?.name || "فایل"),
          size: Number(file?.size || 0),
          url: String(file?.url || ""),
        }))
      : [],
    outputs: Array.isArray(obj.outputs) ? obj.outputs.map(mapLine) : [],
    inputs: Array.isArray(obj.inputs) ? obj.inputs.map(mapLine) : [],
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
  };
}
