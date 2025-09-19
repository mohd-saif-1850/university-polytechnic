import { Router } from "express";
import { createForm, deleteForm, getAllForms, updateForm } from "../controllers/form.controller.js";

const router = Router();

router.route("/add-form").post(createForm);
router.route("/update-form").patch(updateForm);
router.route("/delete-form").delete(deleteForm);
router.route("/get-forms").get(getAllForms);

export default router;
