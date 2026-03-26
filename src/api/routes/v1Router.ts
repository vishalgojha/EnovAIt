import { Router } from "express";

import { adminRouter } from "./adminRoutes.js";
import { channelRouter } from "./channelRoutes.js";
import { chatRouter } from "./chatRoutes.js";
import { dataRouter } from "./dataRoutes.js";
import { reportRouter } from "./reportRoutes.js";
import { workflowRouter } from "./workflowRoutes.js";

export const v1Router = Router();

v1Router.use("/chat", chatRouter);
v1Router.use("/channels", channelRouter);
v1Router.use("/data", dataRouter);
v1Router.use("/workflows", workflowRouter);
v1Router.use("/reports", reportRouter);
v1Router.use("/admin", adminRouter);
