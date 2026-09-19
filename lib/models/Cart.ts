import { Schema, model, models } from "mongoose";

const CartItemSchema = new Schema(
  { productId: { type: Schema.Types.ObjectId, ref: "Product", required: true }, qty: { type: Number, required: true, min: 1 } },
  { _id: false }
);

const CartSchema = new Schema(
  { userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true }, items: [CartItemSchema] },
  { timestamps: true }
);

export default models.Cart || model("Cart", CartSchema);
