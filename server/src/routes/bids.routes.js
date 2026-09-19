import { Router } from "express";
import { getBids, placeBid, acceptBid } from "../controllers/bidController.js";

const router = Router();

router.get("/", getBids);
router.post("/", placeBid);
router.post("/:bidId/accept", acceptBid);

export default router;
