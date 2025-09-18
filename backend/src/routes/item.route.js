import { Router } from "express";
import { createItem, deleteItem, getAllItems, updateItem } from "../controllers/item.controller.js";

const router = Router();

router.post("/add-item", createItem);
router.delete("/delete-item", deleteItem);
router.patch("/update-item", updateItem);
router.get("/get-items", getAllItems);

export default router;
