import mongoose from "mongoose";
import {CustomPropertySchema} from "./customProperty.model.js";

const ListSchema = new mongoose.Schema(
  {
    title: String,
    customProperties: [CustomPropertySchema],
  },
  { timestamps: true }
);

export const List = mongoose.model("List", ListSchema);
