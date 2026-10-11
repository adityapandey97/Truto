import { describe, it, expect } from 'vitest';
import { reviewService } from '../services/reviewService.js';

describe('Review Service Status Transitions', () => {
  it('updates review status to approved in demo mode', async () => {
    const reviews = await reviewService.getReviews();
    expect(reviews.length).toBeGreaterThan(0);

    const targetReview = reviews[0];
    const updated = await reviewService.updateReviewStatus(targetReview.id, 'approved');

    expect(updated.status).toBe('approved');

    const fetched = await reviewService.getReviewById(targetReview.id);
    expect(fetched.status).toBe('approved');
  });

  it('updates review status to rejected in demo mode', async () => {
    const reviews = await reviewService.getReviews();
    const targetReview = reviews[0];

    const updated = await reviewService.updateReviewStatus(targetReview.id, 'rejected');
    expect(updated.status).toBe('rejected');
  });
});
