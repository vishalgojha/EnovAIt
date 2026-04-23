import { Router } from 'express';

import { asyncHandler } from '../../lib/asyncHandler.js';
import { chatHandler, getProvidersHandler } from '../controllers/chatController.js';

export const chatRouter = Router();

chatRouter.post('/chat', asyncHandler(chatHandler));
chatRouter.get('/providers', asyncHandler(getProvidersHandler));
