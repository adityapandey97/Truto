import { RepositoryService } from '../services/repository.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class RepositoryController {
  static getRepositories = asyncHandler(async (req, res) => {
    const repos = await RepositoryService.getRepositories(req.user.id, req.query);
    return ApiResponse.success(res, repos, 200, 'Repositories retrieved successfully');
  });

  static getRepositoryById = asyncHandler(async (req, res) => {
    const repo = await RepositoryService.getRepositoryById(req.user.id, req.params.id);
    return ApiResponse.success(res, repo);
  });

  static getRepositoryFiles = asyncHandler(async (req, res) => {
    const files = await RepositoryService.getRepositoryFiles(req.user.id, req.params.id);
    return ApiResponse.success(res, files);
  });

  static getFileContent = asyncHandler(async (req, res) => {
    const file = await RepositoryService.getFileContent(req.user.id, req.params.id, req.params.fileId);
    return ApiResponse.success(res, file);
  });

  static createRepository = asyncHandler(async (req, res) => {
    const repo = await RepositoryService.createRepository(req.user.id, req.body);
    return ApiResponse.created(res, repo, 'Repository successfully imported');
  });

  static triggerReindex = asyncHandler(async (req, res) => {
    const result = await RepositoryService.triggerReindex(req.user.id, req.params.id);
    return ApiResponse.success(res, result, 200, 'Re-indexing initiated');
  });

  static deleteRepository = asyncHandler(async (req, res) => {
    await RepositoryService.deleteRepository(req.user.id, req.params.id);
    return ApiResponse.success(res, { id: req.params.id }, 200, 'Repository deleted successfully');
  });
}
