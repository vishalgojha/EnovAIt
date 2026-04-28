import { Router } from "express";

import { adminRouter } from "./adminRoutes.js";
import { brsrReadinessRouter } from "./brsrReadinessRoutes.js";
import { channelRouter } from "./channelRoutes.js";
import { chatRouter } from "./chatRoutes.js";
import { dashboardRouter } from "./dashboardRoutes.js";
import { dataRouter } from "./dataRoutes.js";
import { emailIntakeRouter } from "./emailIntakeRoutes.js";
import { reportRouter } from "./reportRoutes.js";
import { reviewRouter } from "./reviewRoutes.js";
import { whatsappIntakeRouter } from "./whatsappIntakeRoutes.js";
import { workflowRouter } from "./workflowRoutes.js";

export const v1Router = Router();

v1Router.use("/chat", chatRouter);
v1Router.use("/channels", channelRouter);
v1Router.use("/dashboard", dashboardRouter);
v1Router.use("/data", dataRouter);
v1Router.use("/workflows", workflowRouter);
v1Router.use("/reports", reportRouter);
v1Router.use("/brsr-readiness", brsrReadinessRouter);
v1Router.use("/review", reviewRouter);
v1Router.use("/email-intake", emailIntakeRouter);
v1Router.use("/whatsapp-intake", whatsappIntakeRouter);
v1Router.use("/admin", adminRouter);
