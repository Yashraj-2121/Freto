import { Router } from "express";
import {
  getBookings,
  getBookingById,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { requireAuth } from "../middleware/supabaseAuth.js";

const router = Router();

router.get("/", requireAuth, getBookings);
router.get("/:id", requireAuth, getBookingById);
router.put("/:id/status", requireAuth, updateBookingStatus);

export default router;
