import type { Request, Response } from "express";

import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { getRequestContext } from "../../lib/requestContext.js";
import { documentIngestionService } from "../../services/ingestion/documentIngestionService.js";
import { excelIngestionService } from "../../services/ingestion/excelIngestionService.js";
import {
  DataRecordIdParamSchema,
  DocumentIngestBodySchema,
  ExcelIngestBodySchema,
  ListDataRecordsQuerySchema
} from "../schemas/dataSchemas.js";

export const dataController = {
  async listRecords(req: Request, res: Response) {
    const query = ListDataRecordsQuerySchema.parse(req.query);
    const { auth, supabase } = getRequestContext(req);

    const dbQuery = supabase
      .from("data_records")
      .select("id, module_id, record_type, title, status, data, created_at, updated_at", { count: "exact" })
      .eq("org_id", auth.orgId)
      .order("created_at", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.module_id) {
      dbQuery.eq("module_id", query.module_id);
    }

    const { data, error, count } = await dbQuery;
    if (error) {
      throw new AppError("Failed to list data records", 500, "DB_READ_FAILED", error);
    }

    res.status(200).json({
      data: data ?? [],
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total: count ?? 0
      }
    });
  },

  async getRecord(req: Request, res: Response) {
    const params = DataRecordIdParamSchema.parse(req.params);
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("data_records")
      .select("*")
      .eq("id", params.id)
      .eq("org_id", auth.orgId)
      .single();

    if (error || !data) {
      throw new AppError("Data record not found", 404, "DATA_RECORD_NOT_FOUND", error);
    }

    res.status(200).json({ data });
  },

  async ingestExcel(req: Request, res: Response) {
    const { module_id } = ExcelIngestBodySchema.parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    if (!req.file?.buffer) {
      throw new AppError("Excel file is required", 400, "FILE_REQUIRED");
    }

    const result = await excelIngestionService.ingest(
      supabase,
      auth,
      module_id,
      req.file.buffer,
      req.file.originalname
    );

    res.status(202).json({ data: result });
  },

  async ingestDocument(req: Request, res: Response) {
    const { module_id } = DocumentIngestBodySchema.parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    if (!req.file?.buffer) {
      throw new AppError("File is required", 400, "FILE_REQUIRED");
    }

    logger.info({ module_id, fileName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size }, "Starting document ingestion");

    try {
      const result = await documentIngestionService.ingest(
        supabase,
        auth,
        module_id,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      res.status(202).json({ data: result });
    } catch (error) {
      logger.error({ err: error, module_id, fileName: req.file.originalname }, "Document ingestion failed");
      throw error;
    }
  }
};
