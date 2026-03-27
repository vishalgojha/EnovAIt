import { Router } from "express";

import { workflowController } from "../controllers/workflowController.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const workflowRouter = Router();

workflowRouter.get("/instances", asyncHandler(workflowController.listInstances));
workflowRouter.get("/instances/:id", asyncHandler(workflowController.getInstance));
workflowRouter.post("/instances/:id/transition", asyncHandler(workflowController.transition));
