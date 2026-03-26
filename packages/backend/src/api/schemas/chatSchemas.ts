import { z } from "zod";

export const ChatMessageRequestSchema = z.object({
  session_id: z.string().uuid(),
  message: z.string().min(1).max(8000)
});

export type ChatMessageRequest = z.infer<typeof ChatMessageRequestSchema>;
