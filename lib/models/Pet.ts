import mongoose, { Schema, model, models } from "mongoose";

const PetSchema = new Schema(
  {
    ownerKey: { type: String, required: true, index: true },
    name: { type: String, required: true },
    photo: { type: String, default: "" },
    species: { type: String, required: true },
    breed: { type: String, default: "" },
    province: { type: String, default: "" },
    city: { type: String, default: "" },
    birthday: Date,
    weightKg: Number,
    gender: { type: String, enum: ["male", "female", "unknown"], default: "unknown" },
    allergies: { type: String, default: "" },
    dietaryRestrictions: { type: String, default: "" },
    specialNeeds: { type: String, default: "" },
    microchipNumber: { type: String, default: "" },
    emergencyContactName: { type: String, default: "" },
    emergencyContactPhone: { type: String, default: "" },
  },
  { timestamps: true }
);

if (models.Pet && (!models.Pet.schema.path("city") || !models.Pet.schema.path("province"))) {
  mongoose.deleteModel("Pet");
}

export default models.Pet || model("Pet", PetSchema);
