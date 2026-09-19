import { Router } from "express";
import {
  getTrucks,
  getTruckById,
  createTruck,
  updateTruck,
  deleteTruck,
} from "../controllers/truckController.js";

const router = Router();

router.get("/", getTrucks);
router.get("/:id", getTruckById);
router.post("/", createTruck);
router.put("/:id", updateTruck);
router.delete("/:id", deleteTruck);

export default router;
