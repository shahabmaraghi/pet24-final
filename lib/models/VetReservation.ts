import { Schema, model, models } from "mongoose";

const VetReservationSchema = new Schema(
  {
    vetId: { type: Schema.Types.ObjectId, ref: "Vet", required: true, index: true },
    ownerKey: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    petName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "done", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export default models.VetReservation || model("VetReservation", VetReservationSchema);
