import { Router } from "express";
import { calculateFreight } from "../controllers/calculatorController.js";

const router = Router();

router.post("/", calculateFreight);

export default router;
