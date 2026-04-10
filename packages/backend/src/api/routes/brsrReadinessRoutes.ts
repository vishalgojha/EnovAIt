import { Router } from "express";

import { brsrReadinessController } from "../controllers/brsrReadinessController.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const brsrReadinessRouter = Router();

brsrReadinessRouter.get("/", asyncHandler(brsrReadinessController.getReadiness));
brsrReadinessRouter.get("/sections", asyncHandler(brsrReadinessController.getSectionDetail));
brsrReadinessRouter.get("/principles", asyncHandler(brsrReadinessController.getPrincipleDetail));
brsrReadinessRouter.get("/gaps", asyncHandler(brsrReadinessController.getGaps));
