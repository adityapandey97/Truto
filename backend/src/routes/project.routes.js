import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', ProjectController.getProjects);
router.post('/', validate({ body: createProjectSchema }), ProjectController.createProject);
router.get('/:id', ProjectController.getProjectById);
router.patch('/:id', validate({ body: updateProjectSchema }), ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

export default router;
