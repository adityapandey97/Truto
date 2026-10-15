import { z } from 'zod';

export const updateReviewStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'], {
    errorMap: () => ({ message: 'Status must be pending, approved, or rejected' }),
  }),
});

export const addReviewCommentSchema = z.object({
  text: z.string().trim().min(1, 'Comment text cannot be empty').max(1000),
});
