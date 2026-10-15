import { AiService } from '../services/ai.service.js';
import { Repository } from '../models/Repository.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { assertOwnership } from '../middleware/authorize.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class AiController {
  static chat = asyncHandler(async (req, res) => {
    const { repositoryId, message, conversationId } = req.body;

    const repo = await Repository.findById(repositoryId);
    assertOwnership(repo, req.user.id);

    // Persist user message in conversation thread if conversationId provided
    if (conversationId) {
      const conv = await Conversation.findById(conversationId);
      assertOwnership(conv, req.user.id);

      await Message.create({
        conversationId: conv._id,
        ownerId: req.user.id,
        role: 'user',
        content: message,
      });
    }

    // Call Python AI microservice
    let aiResponse;
    try {
      aiResponse = await AiService.chat(repositoryId, message, conversationId, req.id);
    } catch (err) {
      // Fallback synthesis if AI service is not running
      aiResponse = {
        answer: `### CodePilot Assistant Analysis (Offline Fallback)\n\nProcessed query: "${message}"\n\n> Note: Python AI microservice is not reachable. Connect the AI service at ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}.`,
        citations: [],
        tokens_used: 50,
        model: 'offline-fallback',
        repository_id: repositoryId,
      };
    }

    // Persist assistant reply in conversation thread
    if (conversationId) {
      const citationsFiles = (aiResponse.citations || []).map((c) => c.file_path);
      await Message.create({
        conversationId,
        ownerId: req.user.id,
        role: 'assistant',
        content: aiResponse.answer,
        fileReferences: citationsFiles,
      });

      await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });
    }

    return ApiResponse.success(res, aiResponse, 200, 'Chat response generated');
  });

  static search = asyncHandler(async (req, res) => {
    const { repositoryId, query, limit } = req.body;
    const repo = await Repository.findById(repositoryId);
    assertOwnership(repo, req.user.id);

    const result = await AiService.search(repositoryId, query, limit || 8, req.id);
    return ApiResponse.success(res, result, 200, 'Code search completed');
  });

  static indexRepo = asyncHandler(async (req, res) => {
    const { repositoryId } = req.body;
    const repo = await Repository.findById(repositoryId);
    assertOwnership(repo, req.user.id);

    const result = await AiService.indexRepository(repo, req.id);
    return ApiResponse.success(res, result, 200, 'Repository indexed in AI engine');
  });

  static runAgent = asyncHandler(async (req, res) => {
    const { repositoryId, prompt } = req.body;
    const repo = await Repository.findById(repositoryId);
    assertOwnership(repo, req.user.id);

    const result = await AiService.runAgent(repositoryId, prompt, req.id);
    return ApiResponse.success(res, result, 201, 'Agent execution completed');
  });

  static getAgentRun = asyncHandler(async (req, res) => {
    const result = await AiService.getAgentRun(req.params.runId, req.id);
    return ApiResponse.success(res, result);
  });

  static proposePatch = asyncHandler(async (req, res) => {
    const { repositoryId, taskDescription, affectedFiles } = req.body;
    const repo = await Repository.findById(repositoryId);
    assertOwnership(repo, req.user.id);

    const result = await AiService.proposePatch(repositoryId, taskDescription, affectedFiles, req.id);
    return ApiResponse.created(res, result, 'Multi-file patch proposed');
  });

  static validatePatch = asyncHandler(async (req, res) => {
    const result = await AiService.validatePatch(req.params.patchId, req.id);
    return ApiResponse.success(res, result);
  });

  static applyPatch = asyncHandler(async (req, res) => {
    const { repositoryId } = req.body;
    const repo = await Repository.findById(repositoryId);
    assertOwnership(repo, req.user.id);

    const result = await AiService.applyPatch(req.params.patchId, repositoryId, req.id);
    return ApiResponse.success(res, result, 200, 'Patch successfully applied');
  });

  static verifyPatch = asyncHandler(async (req, res) => {
    const { testCommand } = req.body;
    const result = await AiService.verifyPatch(req.params.patchId, testCommand, req.id);
    return ApiResponse.success(res, result, 200, 'Patch verification completed');
  });
}
