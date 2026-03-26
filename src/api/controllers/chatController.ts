import type { Request, Response } from "express";

import { ChatMessageRequestSchema } from "../schemas/chatSchemas.js";
import { getRequestContext } from "../../lib/requestContext.js";
import { chatService } from "../../services/chat/chatService.js";

export const chatController = {
  async postMessage(req: Request, res: Response) {
    const payload = ChatMessageRequestSchema.parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    const result = await chatService.processMessage(supabase, auth, payload);
    res.status(200).json({ data: result });
  }
};
