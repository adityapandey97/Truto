import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createConversationSchema,
  renameConversationSchema,
  sendMessageSchema,
} from '../validators/conversation.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', ConversationController.getConversations);
router.post('/', validate({ body: createConversationSchema }), ConversationController.createConversation);
router.get('/:id', ConversationController.getConversationById);
router.patch('/:id', validate({ body: renameConversationSchema }), ConversationController.renameConversation);
router.delete('/:id', ConversationController.deleteConversation);
router.post('/:id/messages', validate({ body: sendMessageSchema }), ConversationController.sendMessage);

export default router;
