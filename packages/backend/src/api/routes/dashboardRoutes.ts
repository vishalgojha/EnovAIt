import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { getDashboardStats, getRecentFilings, getActiveModules } from "../../services/reporting/dashboardService.js";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", asyncHandler(async (_req, res) => {
  const stats = await getDashboardStats();
  res.json(stats);
}));

dashboardRouter.get("/filings", asyncHandler(async (_req, res) => {
  const filings = await getRecentFilings();
  res.json(filings);
}));

dashboardRouter.get("/modules", asyncHandler(async (_req, res) => {
  const modules = await getActiveModules();
  res.json(modules);
}));