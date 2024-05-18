import mongoose from "mongoose";

const ListSchema = new mongoose.Schema(
  {
    title: String,
    customProperties: [CustomPropertySchema],
  },
  { timestamps: true }
);

export const List = mongoose.model("List", ListSchema);
