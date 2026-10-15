import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Health & Diagnostic Endpoints', () => {
  it('GET /health returns 200 with runtime statistics', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('memory');
  });

  it('GET /ready returns 200 when database is connected', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database).toBe('connected');
  });

  it('GET /api/v1/non-existent returns 404 with standard error structure', async () => {
    const res = await request(app).get('/api/v1/non-existent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('message');
    expect(res.headers).toHaveProperty('x-request-id');
  });
});
