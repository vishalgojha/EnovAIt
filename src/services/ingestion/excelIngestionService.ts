import * as XLSX from "xlsx";
import type { SupabaseClient } from "@supabase/supabase-js";

import { AppError } from "../../lib/errors.js";
import type { AuthContext } from "../../types/auth.js";

export const excelIngestionService = {
  async ingest(supabase: SupabaseClient, auth: AuthContext, moduleId: string, fileBuffer: Buffer, fileName: string) {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new AppError("Excel file does not contain any sheets", 400, "EMPTY_EXCEL");
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

    if (!rows.length) {
      throw new AppError("Excel sheet is empty", 400, "EMPTY_EXCEL");
    }

    const normalizedRows = rows.slice(0, 500).map((row) => {
      const normalized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        normalized[String(key).trim().toLowerCase().replace(/\s+/g, "_")] = value;
      }
      return normalized;
    });

    const { data, error } = await supabase
      .from("workflow_events")
      .insert({
        org_id: auth.orgId,
        module_id: moduleId,
        event_type: "ingestion.excel.received",
        payload: {
          file_name: fileName,
          row_count: normalizedRows.length,
          sample_rows: normalizedRows.slice(0, 5)
        },
        created_by: auth.userId,
        updated_by: auth.userId
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new AppError("Failed to register ingestion event", 500, "DB_WRITE_FAILED", error);
    }

    return {
      ingestion_event_id: data.id,
      row_count: normalizedRows.length,
      sample_rows: normalizedRows.slice(0, 3)
    };
  }
};
