import { Router } from "express";

import { asyncHandler } from "../../lib/asyncHandler.js";
import { archonController } from "../controllers/archonController.js";

export const archonRouter = Router();

archonRouter.get("/health", asyncHandler(archonController.getHealth));
archonRouter.post("/tasks", asyncHandler(archonController.runTask));
