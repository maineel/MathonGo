import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    list: {
      type: Schema.Types.ObjectId,
      ref: "List",
    },
    customProperties: [CustomPropertySchema],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
