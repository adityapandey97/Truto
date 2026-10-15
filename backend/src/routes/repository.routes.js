import { Router } from 'express';
import { RepositoryController } from '../controllers/repository.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createRepositorySchema } from '../validators/repository.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', RepositoryController.getRepositories);
router.post('/', validate({ body: createRepositorySchema }), RepositoryController.createRepository);
router.get('/:id', RepositoryController.getRepositoryById);
router.get('/:id/files', RepositoryController.getRepositoryFiles);
router.get('/:id/files/:fileId', RepositoryController.getFileContent);
router.post('/:id/reindex', RepositoryController.triggerReindex);
router.delete('/:id', RepositoryController.deleteRepository);

export default router;
