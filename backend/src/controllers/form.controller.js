import { FormModel } from "../models/form.model.js";
import { ItemModel } from "../models/item.model.js";

export const createForm = async (req, res) => {
  try {
    const { shop, room, item, message, quantity } = req.body;

    if (!shop) return res.status(400).json({ success: false, message: "Shop Name is Required !" });
    if (!item) return res.status(400).json({ success: false, message: "Item Name is Required !" });

    const itemDoc = await ItemModel.findOne({ name: { $regex: `^${item.trim()}$`, $options: "i" } });
    if (!itemDoc) return res.status(404).json({ success: false, message: "Item not found. Recheck item name." });

    if (!itemDoc.isAvailable) return res.status(400).json({ success: false, message: "Selected item is not available" });

    const qty = Number(quantity) || 1;
    if (qty <= 0) return res.status(400).json({ success: false, message: "Invalid quantity" });

    if ((Number(itemDoc.quantity) || 0) < qty) return res.status(400).json({ success: false, message: `Only ${itemDoc.quantity} available` });

    const itemTotalPrice = Number(itemDoc.price) || 0;
    const itemTotalQuantity = Number(itemDoc.quantity) || 1;
    const unitPrice = itemTotalQuantity > 0 ? itemTotalPrice / itemTotalQuantity : itemTotalPrice;
    const totalPrice = Number((unitPrice * qty).toFixed(2));

    const newQty = Number(itemDoc.quantity) - qty;
    await ItemModel.findByIdAndUpdate(itemDoc._id, { quantity: newQty, isAvailable: newQty > 0 }, { new: true });

    const form = await FormModel.create({
      shop,
      room: Number(room) || 0,
      item: itemDoc.name,
      price: Number(unitPrice.toFixed(2)),
      quantity: qty,
      totalPrice,
      isAvailable: newQty > 0,
      message: message || ""
    });

    return res.status(201).json({ success: true, form, message: "Form Created Successfully !" });
  } catch (err) {
    console.error("createForm error:", err);
    return res.status(500).json({ success: false, message: "Server error creating form" });
  }
};

export const getAllForms = async (req, res) => {
  try {
    const forms = await FormModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, forms, message: "All forms fetched successfully!" });
  } catch (error) {
    console.error("getAllForms error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching forms!" });
  }
};

export const updateForm = async (req, res) => {
  try {
    const { formId, newShop, newRoom, newItem, newMessage, newQuantity } = req.body;
    if (!formId) return res.status(400).json({ success: false, message: "Form ID is required!" });

    const current = await FormModel.findById(formId);
    if (!current) return res.status(404).json({ success: false, message: "Form not found!" });

    const updateData = {};
    if (newShop !== undefined) updateData.shop = newShop;
    if (newRoom !== undefined) updateData.room = Number(newRoom);
    if (newMessage !== undefined) updateData.message = newMessage;

    if (newItem) {
      const itemDoc = await ItemModel.findOne({ name: { $regex: `^${newItem.trim()}$`, $options: "i" } });
      if (!itemDoc) return res.status(404).json({ success: false, message: "Item not found!" });
      const itemTotalPrice = Number(itemDoc.price) || 0;
      const itemTotalQuantity = Number(itemDoc.quantity) || 1;
      const unitPrice = itemTotalQuantity > 0 ? itemTotalPrice / itemTotalQuantity : itemTotalPrice;
      updateData.item = itemDoc.name;
      updateData.price = Number(unitPrice.toFixed(2));
      updateData.isAvailable = !!itemDoc.isAvailable;
    }

    if (newQuantity !== undefined) updateData.quantity = Number(newQuantity);

    const finalUnitPrice = updateData.price ?? current.price ?? 0;
    const finalQty = updateData.quantity ?? current.quantity ?? 0;
    updateData.totalPrice = Number((finalUnitPrice * finalQty).toFixed(2));

    const updatedForm = await FormModel.findByIdAndUpdate(formId, updateData, { new: true });
    return res.status(200).json({ success: true, updatedForm, message: "Form updated successfully!" });
  } catch (err) {
    console.error("updateForm error:", err);
    return res.status(500).json({ success: false, message: "Server error updating form" });
  }
};

export const deleteForm = async (req, res) => {
  try {
    const { formId } = req.body;
    if (!formId) return res.status(400).json({ success: false, message: "Form ID is Required !" });
    const formDelete = await FormModel.findByIdAndDelete(formId);
    if (!formDelete) return res.status(404).json({ success: false, message: "Form not found!" });
    return res.status(200).json({ success: true, message: "Form Deleted Successfully !" });
  } catch (err) {
    console.error("deleteForm error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting form" });
  }
};
