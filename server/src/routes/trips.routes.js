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
router.get("/:id", requireAuth, getTripById);
router.get("/booking/:bookingId", requireAuth, getTripByBooking);
router.post("/:id/simulate", requireAuth, simulateTripStep);

export default router;
