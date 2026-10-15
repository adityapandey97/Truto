import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for cryptographic safety'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/codepilot'),
  AI_SERVICE_URL: z.string().default('http://localhost:8000'),
  INTERNAL_SERVICE_KEY: z.string().default('dev-internal-service-secret-key-32chars-min'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid or missing environment configuration:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
