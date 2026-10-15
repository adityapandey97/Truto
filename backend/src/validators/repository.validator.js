import { z } from 'zod';

export const createRepositorySchema = z.object({
  name: z.string().trim().min(2, 'Repository name must be at least 2 characters').max(100),
  url: z.string().trim().url('Must be a valid repository URL'),
  branch: z.string().trim().min(1).optional().default('main'),
  description: z.string().trim().max(500).optional().default(''),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ObjectId').optional(),
});
