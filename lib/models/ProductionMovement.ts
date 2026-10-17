import { Schema, model, models } from "mongoose";

const StockSchema = new Schema(
  {
    pallet: { type: Number, default: 0 },
    carton: { type: Number, default: 0 },
    pack: { type: Number, default: 0 },
    unit: { type: Number, default: 0 },
  },
  { _id: false }
);

const LineSchema = new Schema(
  {
    id: String,
    productId: String,
    productName: String,
    supplierId: String,
    supplierName: String,
    productionDate: String,
    expiryDate: String,
    batchNumber: String,
    stock: { type: StockSchema, default: () => ({}) },
    orderQuantity: Number,
  },
  { _id: false }
);

const AttachmentSchema = new Schema(
  {
    name: String,
    size: Number,
    url: String,
  },
  { _id: false }
);

const ProductionMovementSchema = new Schema(
  {
    fromWarehouseId: { type: String, required: true },
    fromWarehouseName: { type: String, default: "" },
    toWarehouseId: { type: String, required: true },
    toWarehouseName: { type: String, default: "" },
    description: { type: String, default: "" },
    attachments: { type: [AttachmentSchema], default: [] },
    outputs: { type: [LineSchema], default: [] },
    inputs: { type: [LineSchema], default: [] },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

if (models.ProductionMovement) delete models.ProductionMovement;

export default model("ProductionMovement", ProductionMovementSchema);
