import { BackgroundJob } from '../models/BackgroundJob.js';
import { Repository } from '../models/Repository.js';
import { ApiError } from '../utils/ApiError.js';
import { assertOwnership } from '../middleware/authorize.js';

const DEFAULT_JOBS = [
  {
    type: 'Repository import',
    status: 'completed',
    progress: 100,
    duration: '12s',
    events: [
      { step: 'Cloning default branch', status: 'completed', time: '4s' },
      { step: 'AST Syntax Validation', status: 'completed', time: '8s' },
    ],
    logs: [
      'Initialized worker thread for repository import',
      'Cloned 142 files from remote git tree',
      'Completed repository import without errors',
    ],
  },
  {
    type: 'Embedding generation',
    status: 'completed',
    progress: 100,
    duration: '28s',
    events: [
      { step: 'Chunking files into 512-token windows', status: 'completed', time: '10s' },
      { step: 'Vector embedding generation', status: 'completed', time: '18s' },
    ],
    logs: [
      'Chunked 34,890 lines of code across 142 files',
      'Generated 1,240 vector embeddings',
      'Stored embeddings in vector store index',
    ],
  },
];

export class JobService {
  /**
   * Get all background jobs for a user.
   * Auto-seeds sample jobs if empty for initial exploration.
   */
  static async getJobs(userId) {
    let jobs = await BackgroundJob.find({ ownerId: userId }).sort({ createdAt: -1 });

    if (jobs.length === 0) {
      let repo = await Repository.findOne({ ownerId: userId });
      if (!repo) {
        repo = await Repository.create({
          ownerId: userId,
          name: 'codepilot-core',
          url: 'https://github.com/truto/codepilot-core',
        });
      }

      const createdJobs = await Promise.all(
        DEFAULT_JOBS.map((j) =>
          BackgroundJob.create({
            ...j,
            ownerId: userId,
            repositoryId: repo._id,
          })
        )
      );

      jobs = createdJobs;
    }

    return jobs;
  }

  static async getJobById(userId, jobId) {
    const job = await BackgroundJob.findById(jobId);
    assertOwnership(job, userId);
    return job;
  }

  static async retryJob(userId, jobId) {
    const job = await BackgroundJob.findById(jobId);
    assertOwnership(job, userId);

    job.status = 'in_progress';
    job.progress = 15;
    job.error = null;
    job.logs.push(`[${new Date().toISOString()}] Manual worker retry triggered`);
    job.events.push({
      step: 'Manual worker retry initiated',
      status: 'in_progress',
      time: '1s',
    });

    await job.save();
    return job;
  }
}
