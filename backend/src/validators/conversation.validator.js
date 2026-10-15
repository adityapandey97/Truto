import { z } from 'zod';

export const createConversationSchema = z.object({
  repositoryId: z.string().min(1, 'Repository ID is required'),
  title: z.string().trim().min(1).max(150).optional().default('New Conversation'),
});

export const renameConversationSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(150),
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message content cannot be empty'),
});
