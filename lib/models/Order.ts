import { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema(
  { productId: { type: Schema.Types.ObjectId, ref: "Product" }, name: String, price: Number, qty: Number },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [OrderItemSchema],
    shippingMethod: String,
    shippingPrice: Number,
    address: { name: String, phone: String, city: String, address: String, postal: String },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled"],
      default: "pending_payment",
    },
    payment: { authority: String, refId: String },
  },
  { timestamps: true }
);

export default models.Order || model("Order", OrderSchema);
