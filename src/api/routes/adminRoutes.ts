import { Router } from "express";

import { adminController } from "../controllers/adminController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/modules", asyncHandler(adminController.listModules));
adminRouter.post("/modules", asyncHandler(adminController.createModule));
adminRouter.put("/modules/:id", asyncHandler(adminController.updateModule));

adminRouter.get("/templates", asyncHandler(adminController.listTemplates));
adminRouter.post("/templates", asyncHandler(adminController.createTemplate));
adminRouter.put("/templates/:id", asyncHandler(adminController.updateTemplate));

adminRouter.get("/workflow-rules", asyncHandler(adminController.listWorkflowRules));
adminRouter.post("/workflow-rules", asyncHandler(adminController.createWorkflowRule));
adminRouter.put("/workflow-rules/:id", asyncHandler(adminController.updateWorkflowRule));

adminRouter.get("/settings", asyncHandler(adminController.getOrgSettings));
adminRouter.put("/settings", asyncHandler(adminController.updateOrgSettings));
