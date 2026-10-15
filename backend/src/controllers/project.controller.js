import { ProjectService } from '../services/project.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class ProjectController {
  static getProjects = asyncHandler(async (req, res) => {
    const { items, pagination } = await ProjectService.getProjects(req.user.id, req.query);
    return ApiResponse.success(res, items, 200, 'Projects retrieved successfully', pagination);
  });

  static createProject = asyncHandler(async (req, res) => {
    const project = await ProjectService.createProject(req.user.id, req.body);
    return ApiResponse.created(res, project, 'Project successfully created');
  });

  static getProjectById = asyncHandler(async (req, res) => {
    const project = await ProjectService.getProjectById(req.user.id, req.params.id);
    return ApiResponse.success(res, project);
  });

  static updateProject = asyncHandler(async (req, res) => {
    const project = await ProjectService.updateProject(req.user.id, req.params.id, req.body);
    return ApiResponse.success(res, project, 200, 'Project updated successfully');
  });

  static deleteProject = asyncHandler(async (req, res) => {
    await ProjectService.deleteProject(req.user.id, req.params.id);
    return ApiResponse.success(res, { id: req.params.id }, 200, 'Project deleted successfully');
  });
}
