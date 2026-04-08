import type { SupabaseClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

import { AppError } from "../../lib/errors.js";
import type { AuthContext } from "../../types/auth.js";
import { workflowEngine } from "../workflow/workflowEngine.js";

interface IngestionSummary {
  file_name: string;
  mime_type: string;
  kind: "pdf" | "spreadsheet" | "text" | "unknown";
  page_count?: number;
  row_count?: number;
  text_preview: string;
  record_id: string;
  ingestion_event_id: string;
}

const previewText = (value: string, maxLength = 1800): string =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

const normalizeFileStem = (fileName: string): string =>
  fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .slice(0, 120) || "Imported document";

const extractTextFromPdf = async (fileBuffer: Buffer): Promise<{ text: string; pageCount: number }> => {
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = (pdfParseModule as unknown as { default?: (input: Buffer) => Promise<{ text: string; numpages?: number }> }).default;
  if (!pdfParse) {
    throw new AppError("PDF parser unavailable", 500, "PDF_PARSE_UNAVAILABLE");
  }

  const parsed = await pdfParse(fileBuffer);
  return {
    text: parsed.text ?? "",
    pageCount: parsed.numpages ?? 0
  };
};

const extractRowsFromSpreadsheet = (fileBuffer: Buffer): { text: string; rowCount: number } => {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new AppError("Spreadsheet does not contain any sheets", 400, "EMPTY_SPREADSHEET");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

  if (!rows.length) {
    throw new AppError("Spreadsheet is empty", 400, "EMPTY_SPREADSHEET");
  }

  const text = rows
    .slice(0, 25)
    .map((row) =>
      Object.entries(row)
        .map(([key, value]) => `${key}: ${value === null ? "" : String(value)}`)
        .join(" | ")
    )
    .join("\n");

  return {
    text,
    rowCount: rows.length
  };
};

const extractTextFromPlainFile = (fileBuffer: Buffer): string =>
  fileBuffer.toString("utf8").replace(/\u0000/g, "").trim();

const determineKind = (fileName: string, mimeType?: string): IngestionSummary["kind"] => {
  const lowerName = fileName.toLowerCase();
  const lowerMime = (mimeType ?? "").toLowerCase();

  if (lowerMime.includes("pdf") || lowerName.endsWith(".pdf")) {
    return "pdf";
  }
  if (
    lowerMime.includes("spreadsheet") ||
    lowerMime.includes("excel") ||
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".xls") ||
    lowerName.endsWith(".csv")
  ) {
    return "spreadsheet";
  }
  if (lowerMime.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
    return "text";
  }
  return "unknown";
};

export const documentIngestionService = {
  async ingest(
    supabase: SupabaseClient,
    auth: AuthContext,
    moduleId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType?: string
  ): Promise<IngestionSummary> {
    const kind = determineKind(fileName, mimeType);
    let extractedText = "";
    let pageCount: number | undefined;
    let rowCount: number | undefined;

    if (kind === "pdf") {
      const pdf = await extractTextFromPdf(fileBuffer);
      extractedText = pdf.text;
      pageCount = pdf.pageCount;
    } else if (kind === "spreadsheet") {
      const sheet = extractRowsFromSpreadsheet(fileBuffer);
      extractedText = sheet.text;
      rowCount = sheet.rowCount;
    } else if (kind === "text") {
      extractedText = extractTextFromPlainFile(fileBuffer);
    } else {
      throw new AppError("Unsupported file type for ingestion", 400, "UNSUPPORTED_FILE_TYPE");
    }

    const summaryText = previewText(extractedText || fileName);
    const title = normalizeFileStem(fileName);

    const { data: record, error: recordError } = await supabase
      .from("data_records")
      .insert({
        org_id: auth.orgId,
        module_id: moduleId,
        record_type: "brsr_evidence_pack",
        title,
        normalized_key: `${moduleId}:${fileName.toLowerCase()}`,
        source_channel: "file_upload",
        status: "final",
        data: {
          record_type: "brsr_evidence_pack",
          source_channel: "file_upload",
          file_name: fileName,
          mime_type: mimeType ?? null,
          kind,
          page_count: pageCount ?? null,
          row_count: rowCount ?? null,
          text_preview: summaryText,
          extracted_text: previewText(extractedText, 12000)
        },
        created_by: auth.userId,
        updated_by: auth.userId
      })
      .select("id")
      .single();

    if (recordError || !record) {
      throw new AppError("Failed to create evidence record", 500, "DB_WRITE_FAILED", recordError);
    }

    const { data: event, error: eventError } = await supabase
      .from("workflow_events")
      .insert({
        org_id: auth.orgId,
        module_id: moduleId,
        data_record_id: record.id,
        event_type: "ingestion.document.received",
        payload: {
          file_name: fileName,
          mime_type: mimeType ?? null,
          kind,
          page_count: pageCount ?? null,
          row_count: rowCount ?? null,
          text_preview: summaryText
        },
        created_by: auth.userId,
        updated_by: auth.userId
      })
      .select("id")
      .single();

    if (eventError || !event) {
      throw new AppError("Failed to register ingestion event", 500, "DB_WRITE_FAILED", eventError);
    }

    await workflowEngine.runForRecord(supabase, {
      orgId: auth.orgId,
      moduleId,
      dataRecordId: record.id,
      recordData: {
        record_type: "brsr_evidence_pack",
        source_channel: "file_upload",
        file_name: fileName,
        mime_type: mimeType ?? null,
        kind,
        page_count: pageCount ?? null,
        row_count: rowCount ?? null,
        text_preview: summaryText,
        extracted_text: previewText(extractedText, 12000)
      },
      actorUserId: auth.userId,
      triggerEvent: "record.completed"
    });

    return {
      file_name: fileName,
      mime_type: mimeType ?? "application/octet-stream",
      kind,
      page_count: pageCount,
      row_count: rowCount,
      text_preview: summaryText,
      record_id: record.id,
      ingestion_event_id: event.id
    };
  }
};
