import { z } from 'zod';

export const updateSettingsSchema = z.object({
  theme: z.enum(['dark', 'light']).optional(),
  fontSize: z.number().min(10).max(24).optional(),
  tabSize: z.number().min(2).max(8).optional(),
  defaultLang: z.string().trim().optional(),
  notifyOnComplete: z.boolean().optional(),
  sidebarCollapsed: z.boolean().optional(),
});
