import { Router } from "express";
import { register, login, demoLogin, getMe, sendOtp, verifyOtp } from "../controllers/authController.js";
import { requireAuth as authenticate } from "../middleware/supabaseAuth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);
router.post("/demo-login", demoLogin);
router.get("/me", authenticate, getMe);

export default router;
