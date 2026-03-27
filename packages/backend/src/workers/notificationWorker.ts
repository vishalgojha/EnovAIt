import type { SupportedChannel } from "../api/schemas/channelSchemas.js";
import { logger } from "../lib/logger.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { channelRegistry } from "../services/channels/channelRegistry.js";

interface NotificationRow {
  id: string;
  org_id: string;
  user_id: string | null;
  channel: "in_app" | "email" | "webhook";
  status: "pending" | "sent" | "failed";
  title: string | null;
  body: string | null;
  metadata: Record<string, unknown> | null;
  subject: string | null;
  message: string | null;
  payload: Record<string, unknown> | null;
  retry_count: number;
  user:
    | {
        email: string | null;
      }
    | Array<{
        email: string | null;
      }>
    | null;
}

const POLL_MS = 5000;
const MAX_RETRY_COUNT = 3;
const MAX_BATCH = 50;

let intervalHandle: NodeJS.Timeout | null = null;
let isPolling = false;

const mapNotificationChannel = (channel: NotificationRow["channel"]): SupportedChannel => {
  switch (channel) {
    case "in_app":
      return "web_widget";
    case "email":
      return "email";
    case "webhook":
      return "api_partner";
    default:
      return "web_widget";
  }
};

const parseMetadata = (metadata: unknown): Record<string, unknown> => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  return metadata as Record<string, unknown>;
};

const pickRecipient = (row: NotificationRow, metadata: Record<string, unknown>): string | undefined => {
  const metaRecipient = metadata["to"];
  if (typeof metaRecipient === "string" && metaRecipient.trim().length > 0) {
    return metaRecipient.trim();
  }

  const relatedUser = Array.isArray(row.user) ? row.user[0] : row.user;
  if (row.channel === "email" && relatedUser?.email) {
    return relatedUser.email;
  }

  if (row.channel === "in_app" && row.user_id) {
    return row.user_id;
  }

  return undefined;
};

const markSent = async (row: NotificationRow): Promise<void> => {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("notifications")
    .update({
      status: "sent",
      sent_at: now,
      last_error: null
    })
    .eq("id", row.id)
    .eq("org_id", row.org_id);

  if (error) {
    logger.error({ err: error, notification_id: row.id }, "Failed to mark notification as sent");
  }
};

const markFailure = async (row: NotificationRow, error: unknown): Promise<void> => {
  const nextRetry = row.retry_count + 1;
  const nextStatus = nextRetry >= MAX_RETRY_COUNT ? "failed" : "pending";
  const message = error instanceof Error ? error.message : "Notification dispatch failed";

  const { error: updateError } = await supabaseAdmin
    .from("notifications")
    .update({
      retry_count: nextRetry,
      status: nextStatus,
      last_error: message.slice(0, 2000)
    })
    .eq("id", row.id)
    .eq("org_id", row.org_id);

  if (updateError) {
    logger.error({ err: updateError, notification_id: row.id }, "Failed to update notification retry state");
  }
};

const processOne = async (row: NotificationRow): Promise<void> => {
  const metadata = parseMetadata(row.metadata ?? row.payload);
  const subject = row.title ?? row.subject ?? "Notification";
  const message = row.body ?? row.message ?? "";
  const dispatchChannel = mapNotificationChannel(row.channel);
  const recipient = pickRecipient(row, metadata);

  await channelRegistry.send(dispatchChannel, {
    to: recipient,
    subject,
    message,
    metadata: {
      ...metadata,
      notification_id: row.id,
      org_id: row.org_id,
      queued_channel: row.channel
    }
  });
};

const pollOnce = async (): Promise<void> => {
  if (isPolling) {
    return;
  }
  isPolling = true;

  try {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select(
        "id, org_id, user_id, channel, status, title, body, metadata, subject, message, payload, retry_count, user:users(email)"
      )
      .eq("status", "pending")
      .lte("scheduled_at", nowIso)
      .order("created_at", { ascending: true })
      .limit(MAX_BATCH);

    if (error) {
      logger.error({ err: error }, "Failed to poll pending notifications");
      return;
    }

    const rows = (data ?? []) as NotificationRow[];
    for (const row of rows) {
      try {
        await processOne(row);
        await markSent(row);
      } catch (dispatchError) {
        logger.error(
          { err: dispatchError, notification_id: row.id, channel: row.channel },
          "Notification dispatch failed"
        );
        await markFailure(row, dispatchError);
      }
    }
  } finally {
    isPolling = false;
  }
};

export const startNotificationWorker = (): void => {
  if (intervalHandle) {
    return;
  }

  intervalHandle = setInterval(() => {
    void pollOnce();
  }, POLL_MS);

  void pollOnce();
  logger.info({ poll_ms: POLL_MS }, "Notification worker started");
};

export const stopNotificationWorker = (): void => {
  if (!intervalHandle) {
    return;
  }

  clearInterval(intervalHandle);
  intervalHandle = null;
  logger.info("Notification worker stopped");
};
