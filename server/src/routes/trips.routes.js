import { Router } from "express";
import {
  getTripById,
  getTripByBooking,
  simulateTripStep,
} from "../controllers/tripController.js";

const router = Router();

router.get("/:id", getTripById);
router.get("/booking/:bookingId", getTripByBooking);
router.post("/:id/simulate", simulateTripStep);

export default router;
