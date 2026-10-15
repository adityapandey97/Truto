import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(100),
  description: z.string().trim().max(500).optional().default(''),
  projectType: z.enum(['monorepo', 'service', 'library', 'fullstack']).optional().default('fullstack'),
  settings: z.record(z.any()).optional().default({}),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  projectType: z.enum(['monorepo', 'service', 'library', 'fullstack']).optional(),
  settings: z.record(z.any()).optional(),
});
