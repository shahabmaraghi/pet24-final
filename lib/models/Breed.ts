import { Schema, model, models } from "mongoose";

const BreedSchema = new Schema(
  {
    species: { type: String, required: true, index: true },
    title: { type: String, required: true },
    nameEn: { type: String, default: "" },
    aliases: { type: [String], default: [] },
    size: { type: String, enum: ["toy", "small", "medium", "large", "giant"], default: "medium" },
    foodKeywords: { type: [String], default: [] },
    accessoryKeywords: { type: [String], default: [] },
    avoidKeywords: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BreedSchema.index({ species: 1, title: 1 }, { unique: true });

export default models.Breed || model("Breed", BreedSchema);
