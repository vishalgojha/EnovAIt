import { Router } from "express";
import multer from "multer";

import { dataController } from "../controllers/dataController.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const dataRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});

dataRouter.get("/records", asyncHandler(dataController.listRecords));
dataRouter.get("/records/:id", asyncHandler(dataController.getRecord));
dataRouter.post("/ingest/excel", upload.single("file"), asyncHandler(dataController.ingestExcel));
dataRouter.post("/ingest/document", upload.single("file"), asyncHandler(dataController.ingestDocument));
