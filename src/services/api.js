/**
 * API service for handling data fetching and submission
 */

import { API_ENDPOINTS, APP_CONFIG } from '../constants/urls';

/**
 * Base fetch function with common configuration
 */
const baseFetch = async (url, options = {}) => {
  const config = {
    timeout: APP_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * GET request
 */
export const get = async (url, options = {}) => {
  return baseFetch(url, { method: 'GET', ...options });
};

/**
 * POST request
 */
export const post = async (url, data, options = {}) => {
  return baseFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * PUT request
 */
export const put = async (url, data, options = {}) => {
  return baseFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * DELETE request
 */
export const del = async (url, options = {}) => {
  return baseFetch(url, { method: 'DELETE', ...options });
};

// Specific API functions for the app

/**
 * Submit form data
 */
export const submitFormData = async formData => {
  return post(API_ENDPOINTS.SUBMIT_FORM, formData);
};

/**
 * Get all forms
 */
export const getForms = async () => {
  return get(API_ENDPOINTS.GET_FORMS);
};

/**
 * Submit feedback
 */
export const submitFeedback = async feedbackData => {
  return post(API_ENDPOINTS.SUBMIT_FEEDBACK, feedbackData);
};

/**
 * Get feedback
 */
export const getFeedback = async () => {
  return get(API_ENDPOINTS.GET_FEEDBACK);
};

/**
 * Upload file
 */
export const uploadFile = async file => {
  const formData = new FormData();
  formData.append('file', file);

  return baseFetch(API_ENDPOINTS.UPLOAD_FILE, {
    method: 'POST',
    body: formData,
    headers: {
      // Don't set Content-Type for FormData, let the browser set it
    },
  });
};

/**
 * Mock API functions for development
 * Remove these when you have a real backend
 */
export const mockSubmitFormData = async formData => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Mock API: Form submitted:', formData);

  // Simulate success response
  return {
    success: true,
    data: {
      id: Date.now(),
      message: 'Form submitted successfully',
      timestamp: new Date().toISOString(),
    },
  };
};
