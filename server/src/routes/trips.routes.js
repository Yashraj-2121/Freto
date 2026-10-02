import { Router } from "express";
import {
  getTripById,
  getTripByBooking,
  simulateTripStep,
  getMyTrips
} from "../controllers/tripController.js";
import { requireAuth } from "../middleware/supabaseAuth.js";

const router = Router();

router.get("/mine", requireAuth, getMyTrips);
router.get("/:id", getTripById);
router.get("/booking/:bookingId", getTripByBooking);
router.post("/:id/simulate", simulateTripStep);

export default router;
