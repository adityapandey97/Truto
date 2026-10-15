import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '../validators/settings.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', SettingsController.getSettings);
router.patch('/', validate({ body: updateSettingsSchema }), SettingsController.updateSettings);

export default router;
