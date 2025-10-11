import { Router } from "express";
import { createfirm, deleteFirm, getAllFirms, getFirm, updateFirm } from "../controllers/firm.controller.js";

const router = Router()

router.post("/create-firm",createfirm)
router.patch("/update-firm",updateFirm)
router.delete("/delete-firm",deleteFirm)

router.get("/get-firm",getFirm)
router.get("/get-all-firms",getAllFirms)

export default router;