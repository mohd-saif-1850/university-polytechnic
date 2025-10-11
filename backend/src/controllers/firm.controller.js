import { Firm } from "../models/firm.model.js"

const createfirm = async (req,res) => {
    const {name, quantity, pricePerUnit, totalPrice, vender} = req.body

    if (!name) {
        return res.status(400).json({error : "Name of an Item is Required !"})
    }
    if (!vender) {
        return res.status(400).json({error : "Vender Name is Required !"})
    }

    const firm = await Firm.create({
        name,
        quantity,
        pricePerUnit,
        totalPrice,
        vender
    })

    if (!firm) {
        return res.status(500).json({error : "Server Failed to Create Firm !"})
    }

    return res.status(200).json({
        success: true,
        firm,
        message: "Firm Created Successfully !"
    })
}

const getFirm = async (req,res) => {
    const {name, id} = req.body

    if (!(name || id)) {
        return res.status(404).json({error : "Name or Id of a Firm is Required !"})
    }

    const firm = await Firm.findOne({
        $or: [
            {name},
            {_id: id}
        ]
    })

    if (!firm) {
        return res.status(500).json({error : "Server Failed to Fetched Firm -- Or Firm Not Found !"})
    }

    return res.status(200).json({
        success: true,
        firm,
        message: "Firm Fetched Successfully !"
    })
}

const getAllFirms = async (req,res) => {
    const firms = await Firm.find()

    if (!firms) {
        return res.status(500).json({error : "Server Failed to Fetched Firms -- Or Firm Not Found !"})
    }

    return res.status(200).json({
        success: true,
        firms,
        message: "Firms Fetched Successfully !"
    })
}

const updateFirm = async (req, res) => {
  const { id, name, quantity, pricePerUnit, totalPrice, vender } = req.body;

  if (!id && !name) {
    return res.status(400).json({ error: "Please provide either Firm Id or Name to update !" });
  }

  const updateData = {};

  if (name) updateData.name = name;
  if (quantity !== undefined) updateData.quantity = quantity;
  if (pricePerUnit !== undefined) updateData.pricePerUnit = pricePerUnit;
  if (totalPrice !== undefined) updateData.totalPrice = totalPrice;
  if (vender) updateData.vender = vender;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No Fields Provided to Update !" });
  }

  const firm = await Firm.findOneAndUpdate(
    {
      $or: [{ _id: id }, { name }],
    },
    updateData,
    { new: true, runValidators: true }
  );

  if (!firm) {
    return res.status(404).json({ error: "Firm Not Found !" });
  }

  return res.status(200).json({
    success: true,
    firm,
    message: "Firm Updated Successfully !",
  });
};

const deleteFirm = async (req,res) => {
    const {name,id} = req.body

    if (!id && !name) {
    return res.status(400).json({ error: "Please provide either Firm Id or Name to Delete !" });
    }

    const firm = await Firm.findOneAndDelete({
        $or: [
            {name},
            {_id: id}
        ]
    })

    if (!firm) {
        return res.status(404).json({ error: "Firm Not Found !" });
    }

    return res.status(200).json({
        success: true,
        firm,
        message: "Firm Deleted Successfully !",
    });
}

export {createfirm, getFirm, getAllFirms, updateFirm, deleteFirm}