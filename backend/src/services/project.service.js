import { Project } from '../models/Project.js';
import { ApiError } from '../utils/ApiError.js';
import { assertOwnership } from '../middleware/authorize.js';

export class ProjectService {
  static async getProjects(userId, query = {}) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter = { ownerId: userId };
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      Project.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Project.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createProject(userId, payload) {
    const existing = await Project.findOne({ ownerId: userId, name: payload.name });
    if (existing) {
      throw ApiError.conflict(`A project named '${payload.name}' already exists in your workspace`);
    }

    return Project.create({
      ...payload,
      ownerId: userId,
    });
  }

  static async getProjectById(userId, projectId) {
    const project = await Project.findById(projectId);
    assertOwnership(project, userId);
    return project;
  }

  static async updateProject(userId, projectId, updates) {
    const project = await Project.findById(projectId);
    assertOwnership(project, userId);

    if (updates.name && updates.name !== project.name) {
      const duplicate = await Project.findOne({ ownerId: userId, name: updates.name });
      if (duplicate) {
        throw ApiError.conflict(`A project named '${updates.name}' already exists in your workspace`);
      }
    }

    Object.assign(project, updates);
    return project.save();
  }

  static async deleteProject(userId, projectId) {
    const project = await Project.findById(projectId);
    assertOwnership(project, userId);
    await Project.deleteOne({ _id: projectId });
    return true;
  }
}
