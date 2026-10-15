import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Reviews, Background Jobs & User Settings Endpoints', () => {
  let authToken;

  const getAuthToken = async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Fullstack Engineer',
        email: `fullstack-${Date.now()}@codepilot.dev`,
        password: 'Password123!',
      });
    return res.body.data.token;
  };

  it('GET /api/v1/reviews returns list and PATCH /reviews/:id/status updates status', async () => {
    authToken = await getAuthToken();

    const listRes = await request(app)
      .get('/api/v1/reviews')
      .set('Authorization', `Bearer ${authToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    const reviewId = listRes.body.data[0]._id;

    const patchRes = await request(app)
      .patch(`/api/v1/reviews/${reviewId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'approved' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.status).toBe('approved');
  });

  it('GET /api/v1/jobs returns background jobs and POST /jobs/:id/retry triggers retry', async () => {
    authToken = await getAuthToken();

    const listRes = await request(app)
      .get('/api/v1/jobs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    const jobId = listRes.body.data[0]._id;

    const retryRes = await request(app)
      .post(`/api/v1/jobs/${jobId}/retry`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(retryRes.status).toBe(200);
    expect(retryRes.body.data.status).toBe('in_progress');
  });

  it('GET /api/v1/settings and PATCH /api/v1/settings persists user editor preferences', async () => {
    authToken = await getAuthToken();

    const getRes = await request(app)
      .get('/api/v1/settings')
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.theme).toBe('dark');

    const patchRes = await request(app)
      .patch('/api/v1/settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ fontSize: 16, tabSize: 4 });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.fontSize).toBe(16);
    expect(patchRes.body.data.tabSize).toBe(4);
  });
});
