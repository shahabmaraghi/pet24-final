import { Schema, model, models } from "mongoose";

const BrandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameFa: { type: String, default: "", trim: true },
    logo: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BrandSchema.index({ name: 1 }, { unique: true });

if (models.Brand) delete models.Brand;

export default model("Brand", BrandSchema);
