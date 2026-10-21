import { Schema, model, models } from "mongoose";

const RehomingSchema = new Schema(
  {
    ownerKey: { type: String, required: true, index: true },
    ownerName: { type: String, default: "" },
    petName: { type: String, required: true },
    species: { type: String, required: true },
    province: { type: String, default: "" },
    city: { type: String, default: "" },
    description: { type: String, required: true },
    image: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  },
  { timestamps: true }
);

export default models.Rehoming || model("Rehoming", RehomingSchema);
