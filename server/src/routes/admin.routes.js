import { Router } from "express";
import { getAdminStats } from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/supabaseAuth.js";

const router = Router();

// Stats might be used on the public homepage, so if it's protected, the homepage will get a 401. 
// Given the user wants to protect admin routes, we will restrict it to SHIPPER, TRANSPORTER, DRIVER, or just requireAuth.
router.get("/stats", requireAuth, getAdminStats);

export default router;
