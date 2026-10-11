import { mockJobs } from '../data/jobs.js';
import { simulateDelay, getStorageData, setStorageData } from './mockApi.js';
import { IS_DEMO_MODE, apiClient } from './api.js';

const STORAGE_KEY = 'jobs';

function getLocalJobs() {
  return getStorageData(STORAGE_KEY, mockJobs);
}

export const jobService = {
  async getJobs() {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.get('/jobs');
      return response.data;
    }
    await simulateDelay(250);
    return getLocalJobs();
  },

  async getJobById(id) {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.get(`/jobs/${id}`);
      return response.data;
    }
    await simulateDelay(200);
    const jobs = getLocalJobs();
    const job = jobs.find((j) => j.id === id);
    if (!job) throw new Error(`Job not found: ${id}`);
    return job;
  },

  async retryJob(id) {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.post(`/jobs/${id}/retry`);
      return response.data;
    }
    await simulateDelay(400);
    const jobs = getLocalJobs();
    const job = jobs.find((j) => j.id === id);
    if (!job) throw new Error(`Job not found: ${id}`);
    job.status = 'in_progress';
    job.progress = 10;
    job.error = null;
    job.logs.push(`[${new Date().toISOString()}] Manual retry triggered (Demo simulation)`);
    setStorageData(STORAGE_KEY, jobs);
    return job;
  }
};
