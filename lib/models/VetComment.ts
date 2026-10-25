import { Schema, model, models } from "mongoose";

const VetCommentSchema = new Schema(
  {
    vetId: { type: Schema.Types.ObjectId, ref: "Vet", required: true, index: true },
    ownerKey: { type: String, required: true },
    authorName: { type: String, required: true },
    text: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  },
  { timestamps: true }
);

export default models.VetComment || model("VetComment", VetCommentSchema);
