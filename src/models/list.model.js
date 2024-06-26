import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  fallbackValue: { type: String, required: true },
});

const ListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  properties: [PropertySchema],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

export const List = mongoose.model("List", ListSchema);
