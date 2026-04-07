import type { Request, Response } from "express";

import { archonService } from "../../services/archon/archonService.js";
import { RunArchonTaskSchema } from "../schemas/archonSchemas.js";

export const archonController = {
  async getHealth(_req: Request, res: Response) {
    const data = await archonService.getStatus();
    res.status(200).json({ data });
  },

  async runTask(req: Request, res: Response) {
    const payload = RunArchonTaskSchema.parse(req.body);
    const data = await archonService.runTask(payload);
    res.status(200).json({ data });
  },
};
