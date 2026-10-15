import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Assistant & Conversation Endpoints', () => {
  let authToken;

  const getAuthToken = async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Chat Engineer',
        email: `chat-${Date.now()}@codepilot.dev`,
        password: 'Password123!',
      });
    return res.body.data.token;
  };

  it('GET /api/v1/conversations returns list of chat threads', async () => {
    authToken = await getAuthToken();

    const res = await request(app)
      .get('/api/v1/conversations')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/conversations creates a new thread', async () => {
    authToken = await getAuthToken();

    const reposRes = await request(app)
      .get('/api/v1/repositories')
      .set('Authorization', `Bearer ${authToken}`);

    const repoId = reposRes.body.data[0]._id;

    const convRes = await request(app)
      .post('/api/v1/conversations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        repositoryId: repoId,
        title: 'Memory Profiling Discussion',
      });

    expect(convRes.status).toBe(201);
    expect(convRes.body.data.title).toBe('Memory Profiling Discussion');
  });

  it('POST /api/v1/conversations/:id/messages sends user message and gets assistant reply', async () => {
    authToken = await getAuthToken();

    const convsRes = await request(app)
      .get('/api/v1/conversations')
      .set('Authorization', `Bearer ${authToken}`);

    const convId = convsRes.body.data[0]._id;

    const msgRes = await request(app)
      .post(`/api/v1/conversations/${convId}/messages`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'Explain how Node event loop handles heavy AST tree queries',
      });

    expect(msgRes.status).toBe(201);
    expect(msgRes.body.data).toHaveProperty('userMessage');
    expect(msgRes.body.data).toHaveProperty('assistantMessage');
    expect(msgRes.body.data.userMessage.role).toBe('user');
    expect(msgRes.body.data.assistantMessage.role).toBe('assistant');
    expect(msgRes.body.data.assistantMessage.content).toContain('CodePilot Assistant Analysis');
  });
});
