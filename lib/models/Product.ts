import { Schema, model, models } from "mongoose";

const SpecSchema = new Schema({ k: String, v: String }, { _id: false });

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    categoryId: { type: String, required: true, index: true },
    brandId: { type: String, default: "", index: true },
    type: String,
    price: { type: Number, required: true },
    oldPrice: Number,
    badge: String,
    featured: { type: Boolean, default: false },
    desc: String,
    specs: [SpecSchema],
    images: [String],
    stock: { type: Number, default: 100 },
    available: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

if (models.Product) delete models.Product;

export default model("Product", ProductSchema);
