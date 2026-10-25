import mongoose, { Schema, model, models } from "mongoose";

const VetSchema = new Schema(
  {
    name: { type: String, required: true },
    specialty: { type: String, default: "" },
    bio: { type: String, default: "" },
    province: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    accountEmail: { type: String, default: null },
    images: { type: [String], default: [] },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    status: { type: String, enum: ["pending", "approved", "suspended"], default: "approved" },
  },
  { timestamps: true }
);

VetSchema.index({ accountEmail: 1 }, { unique: true, sparse: true });

if (models.Vet && !models.Vet.schema.path("status")) {
  mongoose.deleteModel("Vet");
}

export default models.Vet || model("Vet", VetSchema);
