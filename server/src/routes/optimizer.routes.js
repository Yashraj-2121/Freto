import { Router } from "express";
import {
  getOptimizerStatus,
  optimizeRoute,
  getSupportedCities,
  consolidateFleet
} from "../controllers/optimizerController.js";

const router = Router();

router.get("/status", getOptimizerStatus);
router.get("/cities", getSupportedCities);
router.post("/route", optimizeRoute);
router.post("/consolidate", consolidateFleet);

export default router;
