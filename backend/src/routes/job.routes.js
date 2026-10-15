import { Router } from 'express';
import { JobController } from '../controllers/job.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', JobController.getJobs);
router.get('/:id', JobController.getJobById);
router.post('/:id/retry', JobController.retryJob);

export default router;
