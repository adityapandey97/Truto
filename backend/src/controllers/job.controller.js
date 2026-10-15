import { JobService } from '../services/job.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class JobController {
  static getJobs = asyncHandler(async (req, res) => {
    const jobs = await JobService.getJobs(req.user.id);
    return ApiResponse.success(res, jobs, 200, 'Background jobs retrieved successfully');
  });

  static getJobById = asyncHandler(async (req, res) => {
    const job = await JobService.getJobById(req.user.id, req.params.id);
    return ApiResponse.success(res, job);
  });

  static retryJob = asyncHandler(async (req, res) => {
    const job = await JobService.retryJob(req.user.id, req.params.id);
    return ApiResponse.success(res, job, 200, 'Job retry initiated');
  });
}
