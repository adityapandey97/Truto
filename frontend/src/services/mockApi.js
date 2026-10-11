// Simulation utility for frontend demo mode
export const simulateDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for local mock storage to support interactive operations in Demo Mode
export const getStorageData = (key, fallback) => {
  try {
    const item = sessionStorage.getItem(`codepilot_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn('Failed to read from session storage:', err);
    return fallback;
  }
};

export const setStorageData = (key, data) => {
  try {
    sessionStorage.setItem(`codepilot_${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save to session storage:', err);
  }
};
