import { Item } from "../models/item.model.js";

const createItem = async (req,res) => {
  const {name,code,specification,consumable} = req.body

  if (!name) {
    return res.status(400).json({error: "Item Name is Required !"})
  }

  const create = await Item.create({
    name,
    code : code ? code : 0,
    specification : specification ? specification : "No Specification",
    consumable
  })

  if (!create) {
    return res.status(500).json({error : "Server Failed to Create the Item !"})
  }

  return res.status(200).json({
    success: true,
    create,
    message: "Item Created Successfully !"
  })
}

const getItem = async (req,res) => {
    const {name,id} = req.body

    if (!(name || id)) {
        return res.status(400).json({error: "Name or Id of an Item is Required !"})
    }

    const item = await Item.findOne({
        $or : [
            {name},
            {_id: id}
        ]
    })

    if (!item) {
        return res.status(501).json({error : "Server Failed to Fetched the Item -- Or Item Not Found !"})
    }

    return res.status(200).json({
        success: true,
        item,
        message: "Item Fetched Successfully !"
    })
}

const getAllItems = async (req,res) => {
    const allItems = await Item.find()

    if (!allItems || allItems.length == 0) {
        return res.status(404).json({error : "No Item Found !"})
    }

    return res.status(200).json({
        success:true,
        allItems,
        message: "Items Fetched Successfully !"
    })
}

const searchItems = async (req,res) => {
    const {name} = req.body

    if (!name) {
        return res.status(400).json({error: "Please Enter the Name of Item !"})
    }

    const items = await Item.find({
        name: { $regex: name, $options: "i" }
    })

    if (!items || items.length == 0) {
        return res.status(404).json({error : "No Item Found !"})
    }

    return res.status(200).json({
        success: true,
        items,
        message: "Items Fetched Successfully !"
    })
}

const updateItem = async (req,res) => {
    const {name,id,code,specification,consumable} = req.body

    if (!(name || id)) {
        return res.status(400).json({error: "Name or Id of an Item is Required !"})
    }

    const updateData = {}

    if (name) updateData.name = name
    if (code !== undefined) updateData.code = code
    if (specification) updateData.specification = specification
    if (typeof consumable === "boolean") updateData.consumable = consumable

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({error: "No Fields Provided to Update !"})
    }

    const item = await Item.findOneAndUpdate(
        {
            $or : [
                {name},
                {_id: id}
            ]
        },
        updateData,
        {new: true, runValidators: true}
    )

    if (!item) {
        return res.status(404).json({error : "Item Not Found !"})
    }

    return res.status(200).json({
        success: true,
        item,
        message: "Item Updated Successfully !"
    })
}

const deleteItem = async (req,res) => {
    const {name, id} = req.body

    if (!(name || id )) {
        return res.status(404).json({error : "Please Enter Name or Id of an Item !"})
    }

    const delItem = await Item.findOneAndDelete({
        $or : [
            {name},
            {_id : id}
        ]
    },{
        new: true
    })

    if (!delItem) {
        return res.status(500).json({error : "Server Failed to Delete an Item -- Or Item Not Found !"})
    }

    return res.status(200).json({
        success: true,
        delItem,
        message : "Item deleted Successfully !"
    })
}

const consumableItems = async (req,res) => {
    const item = await Item.find({consumable : true})

    if (!item || item.length == 0) {
        return res.status(404).json({error : "No Consumable Items Found !"})
    }

    return res.status(200).json({
        success: true,
        item,
        message: "Consumable Items Fetched Successfully !"
    })
}

const nonConsumableItems = async (req,res) => {
    const item = await Item.find({ consumable : false})

    if (!item || item.length == 0) {
        return res.status(404).json({error : "No Non-Consumable Items Found !"})
    }

    return res.status(200).json({
        success: true,
        item,
        message: "Non-Consumable Items Fetched Successfully !"
    })
}

export {createItem, getItem, getAllItems, searchItems, updateItem, deleteItem,
    consumableItems, nonConsumableItems
};