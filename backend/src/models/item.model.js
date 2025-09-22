import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice : { type : Number },
  isAvailable: { type: Boolean, default: true },
  invoiceNumber: { type: String },
  consumed: { type: Boolean, default: false },
  message: { type: String, default: '' }
}, { timestamps: true });

export const ItemModel = mongoose.model("Item", itemSchema);
