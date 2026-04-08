import type { SupportedChannel } from "../../api/schemas/channelSchemas.js";

export interface ChannelSendInput {
  to?: string;
  subject?: string;
  message: string;
  metadata: Record<string, unknown>;
  orgId?: string;
  integrationId?: string;
}

export interface ChannelSendResult {
  channel: SupportedChannel;
  accepted: boolean;
  external_id: string | null;
  detail: string;
}

export interface ChannelStatus {
  channel: SupportedChannel;
  configured: boolean;
  healthy: boolean;
  detail: string;
}

export interface ChannelIngestResult {
  channel: SupportedChannel;
  received: boolean;
  summary: Record<string, unknown>;
}
