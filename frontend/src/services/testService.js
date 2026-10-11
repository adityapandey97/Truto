import { mockTestSummary, mockTestSuites } from '../data/testResults.js';
import { simulateDelay, getStorageData, setStorageData } from './mockApi.js';
import { IS_DEMO_MODE, apiClient } from './api.js';

const STORAGE_SUMMARY_KEY = 'test_summary';
const STORAGE_SUITES_KEY = 'test_suites';

export const testService = {
  async getTestSummary() {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.get('/tests/summary');
      return response.data;
    }
    await simulateDelay(200);
    return getStorageData(STORAGE_SUMMARY_KEY, mockTestSummary);
  },

  async getTestSuites() {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.get('/tests/suites');
      return response.data;
    }
    await simulateDelay(250);
    return getStorageData(STORAGE_SUITES_KEY, mockTestSuites);
  },

  async runDemoTests() {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.post('/tests/run');
      return response.data;
    }
    await simulateDelay(800);
    const summary = {
      ...mockTestSummary,
      lastRunAt: new Date().toISOString()
    };
    setStorageData(STORAGE_SUMMARY_KEY, summary);
    return { summary, suites: mockTestSuites };
  }
};
