import { Router } from "express";

import { reviewController } from "../controllers/reviewController.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const reviewRouter = Router();

reviewRouter.get("/queue", asyncHandler(reviewController.getReviewQueue));
reviewRouter.get("/:id", asyncHandler(reviewController.getReviewDetail));
reviewRouter.post("/:id/approve", asyncHandler(reviewController.approve));
reviewRouter.post("/:id/reject", asyncHandler(reviewController.reject));
reviewRouter.post("/:id/escalate", asyncHandler(reviewController.escalate));
