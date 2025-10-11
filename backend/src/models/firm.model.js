import mongoose, { Schema } from "mongoose";

const firmSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number
    },
    pricePerUnit: {
      type : Number
    },
    totalPrice: {
      type: Number
    },
    vender: {
      type: String
    }
  },
  { timestamps: true }
);

export const Firm = mongoose.model("Firm", firmSchema);
