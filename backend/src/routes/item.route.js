import { Router } from "express";
import { consumableItems, createItem, deleteItem, getAllItems, getItem, nonConsumableItems, searchItems, updateItem} from "../controllers/item.controller.js";

const router = Router();

router.post("/add-item", createItem);
router.patch("/update-item",updateItem)
router.delete("/delete-item",deleteItem)

router.get("/get-item", getItem);
router.get("/get-all-items",getAllItems)
router.get("/search-items",searchItems)

router.get("/consumable-items",consumableItems)
router.get("/non-consumable-items",nonConsumableItems)

export default router;