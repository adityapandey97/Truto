import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { updateReviewStatusSchema, addReviewCommentSchema } from '../validators/review.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', ReviewController.getReviews);
router.get('/:id', ReviewController.getReviewById);
router.patch('/:id/status', validate({ body: updateReviewStatusSchema }), ReviewController.updateReviewStatus);
router.post('/:id/comments', validate({ body: addReviewCommentSchema }), ReviewController.addComment);

export default router;
