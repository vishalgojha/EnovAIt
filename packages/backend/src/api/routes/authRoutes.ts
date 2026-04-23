import { Router } from "express";

import { asyncHandler } from "../../lib/asyncHandler.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authController } from "../controllers/authController.js";

export const authRouter = Router();

authRouter.post("/signup", asyncHandler(authController.signUp));
authRouter.post("/signin", asyncHandler(authController.signIn));
authRouter.get("/me", requireAuth, asyncHandler(authController.me));
