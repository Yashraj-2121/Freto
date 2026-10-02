import { Router } from "express";
import { register, login, demoLogin, getMe } from "../controllers/authController.js";
import { requireAuth as authenticate } from "../middleware/supabaseAuth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/demo-login", demoLogin);
router.get("/me", authenticate, getMe);

export default router;
