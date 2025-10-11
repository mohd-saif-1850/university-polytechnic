import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema({
  name: {
   type: String,
   required: true 
  },
  code: {
    type: String
  },
  specification: {
    type:String
  },
  consumable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const Item = mongoose.model("Item", itemSchema);
