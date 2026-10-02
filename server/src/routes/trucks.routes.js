import { Router } from "express";
import {
  getTrucks,
  getTruckById,
  createTruck,
  updateTruck,
  deleteTruck,
} from "../controllers/truckController.js";
import { requireAuth } from "../middleware/supabaseAuth.js";

const router = Router();

// Trucks can be browsed publicly if needed, but for security, we'll enforce auth
router.get("/", requireAuth, getTrucks);
router.get("/:id", requireAuth, getTruckById);
router.post("/", requireAuth, createTruck);
router.put("/:id", requireAuth, updateTruck);
router.delete("/:id", requireAuth, deleteTruck);

export default router;
