import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Repository Management Endpoints', () => {
  let authToken;

  const getAuthToken = async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Repo Developer',
        email: `repo-${Date.now()}@codepilot.dev`,
        password: 'Password123!',
      });
    return res.body.data.token;
  };

  it('GET /api/v1/repositories auto-seeds codepilot-core if user has no repos', async () => {
    authToken = await getAuthToken();

    const res = await request(app)
      .get('/api/v1/repositories')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toBe('codepilot-core');
  });

  it('POST /api/v1/repositories imports a new codebase', async () => {
    authToken = await getAuthToken();

    const newRepo = {
      name: 'microservice-auth',
      url: 'https://github.com/truto/microservice-auth',
      branch: 'main',
      description: 'Distributed authentication service',
    };

    const res = await request(app)
      .post('/api/v1/repositories')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newRepo);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(newRepo.name);
    expect(res.body.data.files.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/repositories/:id/files returns virtual file tree', async () => {
    authToken = await getAuthToken();

    const listRes = await request(app)
      .get('/api/v1/repositories')
      .set('Authorization', `Bearer ${authToken}`);

    const repoId = listRes.body.data[0]._id;

    const filesRes = await request(app)
      .get(`/api/v1/repositories/${repoId}/files`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(filesRes.status).toBe(200);
    expect(Array.isArray(filesRes.body.data)).toBe(true);
    expect(filesRes.body.data.some((f) => f.name === 'package.json')).toBe(true);
  });

  it('POST /api/v1/repositories/:id/reindex triggers indexing and returns BackgroundJob', async () => {
    authToken = await getAuthToken();

    const listRes = await request(app)
      .get('/api/v1/repositories')
      .set('Authorization', `Bearer ${authToken}`);

    const repoId = listRes.body.data[0]._id;

    const reindexRes = await request(app)
      .post(`/api/v1/repositories/${repoId}/reindex`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(reindexRes.status).toBe(200);
    expect(reindexRes.body.data).toHaveProperty('repository');
    expect(reindexRes.body.data).toHaveProperty('job');
    expect(reindexRes.body.data.job.status).toBe('in_progress');
  });
});
