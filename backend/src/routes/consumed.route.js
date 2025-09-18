import { Router } from "express";
import { recordConsumedItems } from "../controllers/consumed.controller.js";

const router = Router()

router.route("/consumed").get(recordConsumedItems)

export default router;