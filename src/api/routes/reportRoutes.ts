import { Router } from "express";

import { reportController } from "../controllers/reportController.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const reportRouter = Router();

reportRouter.post("/generate", asyncHandler(reportController.generate));
reportRouter.get("/:id", asyncHandler(reportController.getById));
