import { Router } from "express";
import {
  getBookings,
  getBookingById,
  updateBookingStatus,
} from "../controllers/bookingController.js";

const router = Router();

router.get("/", getBookings);
router.get("/:id", getBookingById);
router.put("/:id/status", updateBookingStatus);

export default router;
