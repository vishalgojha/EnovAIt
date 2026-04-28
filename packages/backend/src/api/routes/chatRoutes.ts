import { Router } from 'express';

import { asyncHandler } from '../../lib/asyncHandler.js';
import { chatHandler } from '../controllers/chatController.js';
import { getProvidersHandler } from '../../services/ai/providerService.js';

export const chatRouter = Router();

chatRouter.post('/chat', asyncHandler(chatHandler));
chatRouter.get('/providers', asyncHandler(getProvidersHandler));
