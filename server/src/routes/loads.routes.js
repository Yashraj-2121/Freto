import { Router } from "express";
import {
  getLoads,
  getLoadById,
  createLoad,
  updateLoad,
  deleteLoad,
} from "../controllers/loadController.js";

const router = Router();

router.get("/", getLoads);
router.get("/:id", getLoadById);
router.post("/", createLoad);
router.put("/:id", updateLoad);
router.delete("/:id", deleteLoad);

export default router;
