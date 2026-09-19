import { Router } from "express";
import { getAdminStats } from "../controllers/adminController.js";

const router = Router();

router.get("/stats", getAdminStats);

export default router;
