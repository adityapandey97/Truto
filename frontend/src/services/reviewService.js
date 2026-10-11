import { mockReviews } from '../data/reviews.js';
import { simulateDelay, getStorageData, setStorageData } from './mockApi.js';
import { IS_DEMO_MODE, apiClient } from './api.js';

const STORAGE_KEY = 'reviews';

function getLocalReviews() {
  return getStorageData(STORAGE_KEY, mockReviews);
}

export const reviewService = {
  async getReviews() {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.get('/reviews');
      return response.data;
    }
    await simulateDelay(250);
    return getLocalReviews();
  },

  async getReviewById(id) {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.get(`/reviews/${id}`);
      return response.data;
    }
    await simulateDelay(200);
    const reviews = getLocalReviews();
    const review = reviews.find((r) => r.id === id);
    if (!review) throw new Error(`Review not found: ${id}`);
    return review;
  },

  async updateReviewStatus(id, status) {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.patch(`/reviews/${id}/status`, { status });
      return response.data;
    }
    await simulateDelay(350);
    const reviews = getLocalReviews();
    const review = reviews.find((r) => r.id === id);
    if (!review) throw new Error(`Review not found: ${id}`);
    review.status = status;
    setStorageData(STORAGE_KEY, reviews);
    return review;
  }
};
