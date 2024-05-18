import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  list: { type: mongoose.Schema.Types.ObjectId, ref: "List", required: true },
  customProperties: mongoose.Schema.Types.Mixed,
  isSubscribed: { type: Boolean, default: true },
});

export const User = mongoose.model("User", UserSchema);
