import { Router } from "express";
import { getBids, placeBid, acceptBid } from "../controllers/bidController.js";
import { requireAuth } from "../middleware/supabaseAuth.js";

const router = Router();

router.get("/", requireAuth, getBids);
router.post("/", requireAuth, placeBid);
router.post("/:bidId/accept", requireAuth, acceptBid);

export default router;
