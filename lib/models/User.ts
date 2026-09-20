import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    image: String,
    phone: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    emailVerified: Date,
    recentlyViewed: [
      {
        productId: { type: String, required: true },
        viewedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
  },
  { timestamps: true, collection: "users" }
);

if (models.User && !models.User.schema.path("recentlyViewed")) {
  mongoose.deleteModel("User");
}

export default models.User || model("User", UserSchema);
