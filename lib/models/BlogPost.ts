import mongoose, { Schema, model, models } from "mongoose";

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    category: String,
    excerpt: String,
    author: String,
    coverImage: String,
    content: { type: String, default: "" },
    paragraphs: [String],
  },
  { timestamps: true, strict: false }
);

if (models.BlogPost && !models.BlogPost.schema.path("content")) {
  mongoose.deleteModel("BlogPost");
}

export default models.BlogPost || model("BlogPost", BlogPostSchema);
