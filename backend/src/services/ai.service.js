import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

export class AiService {
  static getHeaders(requestId) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Internal-Service-Key': env.INTERNAL_SERVICE_KEY,
    };
    if (requestId) {
      headers['X-Request-ID'] = requestId;
    }
    return headers;
  }

  static async request(path, options = {}, requestId = null) {
    const url = `${env.AI_SERVICE_URL}${path}`;
    const headers = {
      ...this.getHeaders(requestId),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        const errorMsg = errorData.detail || errorData.message || 'AI service call failed';
        throw new ApiError(response.status, errorMsg, [], 'AI_SERVICE_ERROR');
      }

      return await response.json();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.warn(`AI microservice unreachable at ${url}: ${err.message}`);
      throw ApiError.internal(
        `AI microservice unavailable at ${env.AI_SERVICE_URL}. Verify Python service is running.`,
        'AI_SERVICE_UNAVAILABLE'
      );
    }
  }

  static async checkHealth() {
    try {
      const res = await fetch(`${env.AI_SERVICE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  static async indexRepository(repository, requestId = null) {
    const payload = {
      repository_id: repository._id.toString(),
      owner_id: repository.ownerId.toString(),
      files: (repository.files || []).map((f) => ({
        path: f.path,
        content: f.content,
        language: f.language,
        size: f.size ? parseInt(f.size, 10) || 100 : 100,
      })),
    };

    return this.request(
      `/api/v1/repositories/${repository._id}/index`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      requestId
    );
  }

  static async chat(repositoryId, message, conversationId = null, requestId = null) {
    return this.request(
      `/api/v1/repositories/${repositoryId}/chat`,
      {
        method: 'POST',
        body: JSON.stringify({
          repository_id: repositoryId,
          message,
          conversation_id: conversationId,
        }),
      },
      requestId
    );
  }

  static async search(repositoryId, query, limit = 8, requestId = null) {
    return this.request(
      `/api/v1/repositories/${repositoryId}/search`,
      {
        method: 'POST',
        body: JSON.stringify({
          repository_id: repositoryId,
          query,
          limit,
        }),
      },
      requestId
    );
  }

  static async runAgent(repositoryId, prompt, requestId = null) {
    return this.request(
      `/api/v1/repositories/${repositoryId}/agent-runs`,
      {
        method: 'POST',
        body: JSON.stringify({
          repository_id: repositoryId,
          prompt,
        }),
      },
      requestId
    );
  }

  static async getAgentRun(runId, requestId = null) {
    return this.request(`/api/v1/agent-runs/${runId}`, { method: 'GET' }, requestId);
  }

  static async proposePatch(repositoryId, taskDescription, affectedFiles = null, requestId = null) {
    return this.request(
      `/api/v1/repositories/${repositoryId}/patches`,
      {
        method: 'POST',
        body: JSON.stringify({
          repository_id: repositoryId,
          task_description: taskDescription,
          affected_files: affectedFiles,
        }),
      },
      requestId
    );
  }

  static async validatePatch(patchId, requestId = null) {
    return this.request(`/api/v1/patches/${patchId}/validate`, { method: 'POST' }, requestId);
  }

  static async applyPatch(patchId, repositoryId, requestId = null) {
    return this.request(
      `/api/v1/patches/${patchId}/apply`,
      {
        method: 'POST',
        body: JSON.stringify({ patch_id: patchId, repository_id: repositoryId }),
      },
      requestId
    );
  }

  static async verifyPatch(patchId, testCommand = null, requestId = null) {
    return this.request(
      `/api/v1/patches/${patchId}/verify`,
      {
        method: 'POST',
        body: JSON.stringify({ patch_id: patchId, test_command: testCommand }),
      },
      requestId
    );
  }
}
