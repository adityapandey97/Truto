import { Router } from 'express';
import { AiController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.post('/chat', AiController.chat);
router.post('/search', AiController.search);
router.post('/index', AiController.indexRepo);
router.post('/agent', AiController.runAgent);
router.get('/agent/:runId', AiController.getAgentRun);
router.post('/patches', AiController.proposePatch);
router.post('/patches/:patchId/validate', AiController.validatePatch);
router.post('/patches/:patchId/apply', AiController.applyPatch);
router.post('/patches/:patchId/verify', AiController.verifyPatch);

export default router;
