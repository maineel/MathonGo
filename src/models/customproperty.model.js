import mongoose from "mongoose";

const CustomPropertySchema = new mongoose.Schema(
  {
    title: String,
    value: {
      type: String,
      default: "Ahmedabad",
    },
  },
  { timestamps: true }
);

export const Customproperty = mongoose.model(
  "Customproperty",
  CustomPropertySchema
);
