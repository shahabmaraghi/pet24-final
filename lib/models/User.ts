import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    image: String,
    phone: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    emailVerified: Date,
  },
  { timestamps: true, collection: "users" }
);

export default models.User || model("User", UserSchema);
