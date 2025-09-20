import mongoose, { Schema } from "mongoose";

const formSchema = new Schema(
  {
    shop: { type: String, required: true },
    room: { type: Number, default: 0 },
    item: { type: String, required: true },
    price: { type: Number, required: true },         // unit price
    quantity: { type: Number, required: true },      // quantity purchased
    totalPrice: { type: Number, required: true },    // total = price * quantity
    isAvailable: { type: Boolean, required: true },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

export const FormModel = mongoose.model("Form", formSchema);
