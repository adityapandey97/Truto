import { ReviewService } from '../services/review.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class ReviewController {
  static getReviews = asyncHandler(async (req, res) => {
    const reviews = await ReviewService.getReviews(req.user.id);
    return ApiResponse.success(res, reviews, 200, 'Code reviews retrieved successfully');
  });

  static getReviewById = asyncHandler(async (req, res) => {
    const review = await ReviewService.getReviewById(req.user.id, req.params.id);
    return ApiResponse.success(res, review);
  });

  static updateReviewStatus = asyncHandler(async (req, res) => {
    const review = await ReviewService.updateReviewStatus(req.user.id, req.params.id, req.body.status);
    return ApiResponse.success(res, review, 200, `Review status updated to ${req.body.status}`);
  });

  static addComment = asyncHandler(async (req, res) => {
    const author = req.user?.name || 'Developer';
    const review = await ReviewService.addComment(req.user.id, req.params.id, author, req.body.text);
    return ApiResponse.created(res, review, 'Review comment added successfully');
  });
}
