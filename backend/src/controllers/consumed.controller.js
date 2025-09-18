import { ConsumedModel } from "../models/consumed.model.js";
import { ItemModel } from "../models/item.model.js";

// this will record consumed items into Consumed collection
export const recordConsumedItems = async (req, res) => {
  try {
    const consumedItems = await ItemModel.find({ consumed: true });

    if (!consumedItems || consumedItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No consumed items found !"
      });
    }

    // map into Consumed collection (avoid duplicates)
    const records = [];
    for (const item of consumedItems) {
      // check if already exists in Consumed collection
      const exists = await ConsumedModel.findOne({ itemId: item._id });
      if (!exists) {
        const newRecord = await ConsumedModel.create({
          itemId: item._id,
          itemName: item.name,
          price: item.price,
          quantity: item.quantity,
          invoiceNumber: item.invoiceNumber,
          message: item.message
        });
        records.push(newRecord);
      }
    }

    return res.status(200).json({
      success: true,
      records,
      message: "Consumed items recorded successfully !"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while recording consumed items !",
      error: error.message
    });
  }
};
