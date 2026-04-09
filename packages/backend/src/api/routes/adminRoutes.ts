import { Router } from "express";

import { adminController } from "../controllers/adminController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/platform/summary", asyncHandler(adminController.getPlatformSummary));
adminRouter.get("/platform/logs", asyncHandler(adminController.listPlatformLogs));
adminRouter.get("/platform/approvals", asyncHandler(adminController.listPlatformApprovals));
adminRouter.get("/platform/secrets", asyncHandler(adminController.getPlatformSecrets));
adminRouter.put("/platform/secrets", asyncHandler(adminController.updatePlatformSecrets));

adminRouter.get("/modules", asyncHandler(adminController.listModules));
adminRouter.post("/modules", asyncHandler(adminController.createModule));
adminRouter.put("/modules/:id", asyncHandler(adminController.updateModule));

adminRouter.get("/templates", asyncHandler(adminController.listTemplates));
adminRouter.post("/templates", asyncHandler(adminController.createTemplate));
adminRouter.put("/templates/:id", asyncHandler(adminController.updateTemplate));

adminRouter.get("/workflow-rules", asyncHandler(adminController.listWorkflowRules));
adminRouter.post("/workflow-rules", asyncHandler(adminController.createWorkflowRule));
adminRouter.put("/workflow-rules/:id", asyncHandler(adminController.updateWorkflowRule));

adminRouter.get("/integrations", asyncHandler(adminController.listIntegrations));
adminRouter.post("/integrations", asyncHandler(adminController.createIntegration));
adminRouter.put("/integrations/:id", asyncHandler(adminController.updateIntegration));

adminRouter.get("/settings", asyncHandler(adminController.getOrgSettings));
adminRouter.put("/settings", asyncHandler(adminController.updateOrgSettings));
