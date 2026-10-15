import { Router } from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import repositoryRoutes from './repository.routes.js';
import conversationRoutes from './conversation.routes.js';
import reviewRoutes from './review.routes.js';
import jobRoutes from './job.routes.js';
import settingsRoutes from './settings.routes.js';
import aiRoutes from './ai.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/repositories', repositoryRoutes);
router.use('/conversations', conversationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/jobs', jobRoutes);
router.use('/settings', settingsRoutes);
router.use('/ai', aiRoutes);

export default router;
