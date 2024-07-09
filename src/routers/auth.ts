import { Router } from "express";
import loginController from "../controllers/auth/login";
import checkController from "../controllers/auth/check";
import logoutController from "../controllers/auth/logout";
import signupController from "../controllers/auth/signup";
import { registerWithFAce } from "../controllers/auth/regiserface";
import { loginWithFace } from "../controllers/auth/loginface";

const router = Router();

// router.post("/login", loginController);
router.post("/login", loginWithFace);
router.post("/check", checkController);
router.post("/logout", logoutController);
router.post("/signup", registerWithFAce);
// router.post("/signup", signupController);

export default router;
