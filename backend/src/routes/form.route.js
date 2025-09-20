import { Router } from "express";
import { createForm, deleteForm, getAllForms, updateForm } from "../controllers/form.controller.js";

const router = Router();

router.post("/add-form", createForm);
router.patch("/update-form", updateForm);
router.delete("/delete-form", deleteForm);
router.get("/get-forms", getAllForms);

export default router;
