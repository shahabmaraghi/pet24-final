import { Schema, model, models } from "mongoose";
import "./BlogPost";

const BlogCommentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "BlogPost", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    author: { type: String, required: true },
    text: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminReply: String,
  },
  { timestamps: true }
);

export default models.BlogComment || model("BlogComment", BlogCommentSchema);
