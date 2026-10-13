import { Schema, model, models } from "mongoose";

const SlideSchema = new Schema(
  {
    catId: String,
    tag: String,
    title: { type: String, required: true },
    subtitle: String,
    from: { type: String, default: "#f0ece1" },
    to: { type: String, default: "#e9f1ea" },
    image: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Slide || model("Slide", SlideSchema);
