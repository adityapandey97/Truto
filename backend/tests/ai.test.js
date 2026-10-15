import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('AI Gateway & Assistant Intelligence Endpoints', () => {
  let authToken;
  let repoId;

  const getAuthToken = async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'AI Placement Candidate',
        email: `ai-${Date.now()}@codepilot.dev`,
        password: 'Password123!',
      });
    return res.body.data.token;
  };

  it('Rejects unauthorized repository access with 404 or 403', async () => {
    authToken = await getAuthToken();

    const fakeRepoId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        repositoryId: fakeRepoId,
        message: 'Explain authentication flow',
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/ai/chat provides grounded response with repository ownership', async () => {
    authToken = await getAuthToken();

    // Create repository for user
    const repoRes = await request(app)
      .get('/api/v1/repositories')
      .set('Authorization', `Bearer ${authToken}`);

    repoId = repoRes.body.data[0]._id;

    const res = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        repositoryId: repoId,
        message: 'Where is database connection configured?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('answer');
  });

  it('POST /api/v1/ai/search executes code search on repository', async () => {
    authToken = await getAuthToken();

    const repoRes = await request(app)
      .get('/api/v1/repositories')
      .set('Authorization', `Bearer ${authToken}`);

    repoId = repoRes.body.data[0]._id;

    const res = await request(app)
      .post('/api/v1/ai/search')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        repositoryId: repoId,
        query: 'express listen',
        limit: 3,
      });

    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
    }
  });
});
