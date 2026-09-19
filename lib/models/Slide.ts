import { Schema, model, models } from "mongoose";

const SlideSchema = new Schema(
  {
    catId: String,
    tag: String,
    title: { type: String, required: true },
    subtitle: String,
    from: { type: String, default: "#3f7a5c" },
    to: { type: String, default: "#1f4d38" },
    image: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Slide || model("Slide", SlideSchema);
