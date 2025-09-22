import { FormModel } from "../models/form.model.js";
import { ItemModel } from "../models/item.model.js";

export const createForm = async (req, res) => {
  try {
    const { shop, room, item, message, quantity } = req.body;

    if (!shop) return res.status(400).json({ success: false, message: "Shop Name is Required!" });
    if (!item) return res.status(400).json({ success: false, message: "Item Name is Required!" });
    console.log("item : from form controlller trying : ",item);
    
    const itemDoc = await ItemModel.findOne({ name: { $regex: `^${item.trim()}$`, $options: "i" } });
    console.log("Item Doc : ",itemDoc);
    
    if (!itemDoc) return res.status(404).json({ success: false, message: "Item not found" });
    if (!itemDoc.isAvailable) return res.status(400).json({ success: false, message: "Item not available" });

    const qty = quantity;
    if (!qty || qty <= 0) return res.status(400).json({ success: false, message: "Invalid quantity" });
    if ((itemDoc.quantity || 0) < qty)
      return res.status(400).json({ success: false, message: `Only ${itemDoc.quantity} available` });

    const unitPrice = itemDoc.price / itemDoc.quantity || 0;
    console.log("Unit price from form controller : ",unitPrice);
    
    const totalPrice = (unitPrice * qty).toFixed(2);

    const newQty = Number(itemDoc.quantity) - qty;
    await ItemModel.findByIdAndUpdate(itemDoc._id, { quantity: newQty, isAvailable: newQty > 0 });

    const form = await FormModel.create({
      shop,
      room: Number(room) || 0,
      item: itemDoc.name,
      price: unitPrice,
      quantity: qty,
      totalPrice,
      isAvailable: newQty > 0,
      message: message || ""
    });

    return res.status(201).json({ success: true, form, message: "Form created successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllForms = async (req, res) => {
  try {
    const forms = await FormModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, forms });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error fetching forms" });
  }
};

export const updateForm = async (req, res) => {
  try {
    const { formId, newShop, newRoom, newItem, newMessage, newQuantity } = req.body;
    if (!formId) return res.status(400).json({ success: false, message: "Form ID is required" });

    const current = await FormModel.findById(formId);
    if (!current) return res.status(404).json({ success: false, message: "Form not found" });

    const updateData = {};
    if (newShop !== undefined) updateData.shop = newShop;
    if (newRoom !== undefined) updateData.room = Number(newRoom);
    if (newMessage !== undefined) updateData.message = newMessage;

    if (newItem) {
      const itemDoc = await ItemModel.findOne({ name: { $regex: `^${newItem.trim()}$`, $options: "i" } });
      if (!itemDoc) return res.status(404).json({ success: false, message: "Item not found" });
      updateData.item = itemDoc.name;
      updateData.price = Number(itemDoc.price) || 0;
      updateData.isAvailable = !!itemDoc.isAvailable;
    }

    if (newQuantity !== undefined) updateData.quantity = Number(newQuantity);

    const finalUnitPrice = updateData.price ?? current.price;
    const finalQty = updateData.quantity ?? current.quantity;
    updateData.totalPrice = Number((finalUnitPrice * finalQty).toFixed(2));

    const updatedForm = await FormModel.findByIdAndUpdate(formId, updateData, { new: true });
    return res.status(200).json({ success: true, updatedForm, message: "Form updated successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error updating form" });
  }
};

export const deleteForm = async (req, res) => {
  try {
    const { formId } = req.body;
    if (!formId) return res.status(400).json({ success: false, message: "Form ID is required" });

    const formDelete = await FormModel.findByIdAndDelete(formId);
    if (!formDelete) return res.status(404).json({ success: false, message: "Form not found" });

    return res.status(200).json({ success: true, message: "Form deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error deleting form" });
  }
};
