import mongoose from "mongoose";

const CustomPropertySchema = new mongoose.Schema(
  {
    title: String,
    defaultValue: {
      type: String,
      default: "Ahmedabad",
    },
  },
  { timestamps: true }
);

const CustomProperty = mongoose.model("CustomProperty", CustomPropertySchema);

export { CustomProperty, CustomPropertySchema };
