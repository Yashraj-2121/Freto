import { Router } from "express";
import {
  getLoads,
  getLoadById,
  createLoad,
  updateLoad,
  deleteLoad,
} from "../controllers/loadController.js";
import { requireAuth } from "../middleware/supabaseAuth.js";

const router = Router();

router.get("/", requireAuth, getLoads);
router.get("/:id", requireAuth, getLoadById);
router.post("/", requireAuth, createLoad);
router.put("/:id", requireAuth, updateLoad);
router.delete("/:id", requireAuth, deleteLoad);

export default router;
