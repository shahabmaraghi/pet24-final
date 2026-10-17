import { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    tint: { type: String, default: "#6b7280" },
    image: String,
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, id: false }
);

export default models.Category || model("Category", CategorySchema);
