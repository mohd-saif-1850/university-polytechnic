import { ItemModel } from "../models/item.model.js";

export const createItem = async (req, res) => {
  try {
    const { name, price, unitPrice, quantity, message, invoiceNumber, consumed, isAvailable } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Name is Required !" });
    if (price === undefined || price === null) return res.status(400).json({ success: false, message: "Price is Required !" });
    if (quantity === undefined || quantity === null) return res.status(400).json({ success: false, message: "Quantity is Required !" });

    const existingItem = await ItemModel.findOne({ name: name.trim() });
    if (existingItem) return res.status(400).json({ success: false, message: `Item with Name "${name}" Already Exists !` });

    const item = await ItemModel.create({
      name: name.trim(),
      price: Number(price),
      unitPrice : Number(unitPrice),
      quantity: Number(quantity),
      invoiceNumber: invoiceNumber || "",
      message: message || "",
      consumed: consumed === undefined ? false : Boolean(consumed),
      isAvailable: isAvailable === undefined ? true : Boolean(isAvailable),
    });

    return res.status(201).json({ success: true, item, message: `${item.name} Item Created Successfully !` });
  } catch (err) {
    console.error("createItem error:", err);
    return res.status(500).json({ success: false, message: "Server Failed to Create Item !" });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const items = await ItemModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, items });
  } catch (err) {
    console.error("getAllItems error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching items" });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ success: false, message: "Item ID Required !" });

    const deleted = await ItemModel.findByIdAndDelete(itemId);
    if (!deleted) return res.status(404).json({ success: false, message: "Item not found" });

    return res.status(200).json({ success: true, message: "Item Deleted Successfully !" });
  } catch (err) {
    console.error("deleteItem error:", err);
    return res.status(500).json({ success: false, message: "Server Failed to Delete a Item  !" });
  }
};

export const updateItem = async (req, res) => {
  try {
    const {
      itemId,
      newName, newPrice, newQuantity, newInvoiceNumber, newUnitPrice , newMessage, newConsumable, newIsAvailable,
      name, price, quantity, invoiceNumber, unitPrice, message, consumable, consumed, isAvailable, available
    } = req.body;

    if (!itemId) return res.status(400).json({ success: false, message: "Item ID Required !" });

    const update = {};

    if (newName !== undefined) update.name = newName;
    else if (name !== undefined) update.name = name;

    if (newPrice !== undefined) update.price = String(newPrice);
    else if (price !== undefined) update.price = String(price);

    if (newUnitPrice !== undefined) update.unitPrice = String(newUnitPrice);

    if (newQuantity !== undefined) update.quantity = Number(newQuantity);
    else if (quantity !== undefined) update.quantity = Number(quantity);

    if (newInvoiceNumber !== undefined) update.invoiceNumber = newInvoiceNumber;
    else if (invoiceNumber !== undefined) update.invoiceNumber = invoiceNumber;

    if (newMessage !== undefined) update.message = newMessage;
    else if (message !== undefined) update.message = message;

    if (newConsumable !== undefined) update.consumed = Boolean(newConsumable);
    else if (consumable !== undefined) update.consumed = Boolean(consumable);
    else if (consumed !== undefined) update.consumed = Boolean(consumed);

    if (newIsAvailable !== undefined) update.isAvailable = Boolean(newIsAvailable);
    else if (isAvailable !== undefined) update.isAvailable = Boolean(isAvailable);
    else if (available !== undefined) update.isAvailable = Boolean(available);

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: "Nothing to update !" });
    }

    const updated = await ItemModel.findByIdAndUpdate(itemId, update, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Item not found!" });

    return res.status(200).json({ success: true, update: updated, message: "Item Updated Successfully !" });
  } catch (err) {
    console.error("updateItem error:", err);
    return res.status(500).json({ success: false, message: "Server Failed to Update Item Fields !" });
  }
};
