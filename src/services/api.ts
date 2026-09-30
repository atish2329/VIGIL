import {
  AnalyzeMessageRequest,
  AnalyzeURLRequest,
  AnalyzeScreenshotRequest,
  APIResponse,
  AnalysisResult,
  HistoryItem,
  DashboardMetrics,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper to construct URL
const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

// Error handler
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Timeout utility
const withTimeout = async <T>(
  promise: Promise<T>,
  timeout: number = 30000
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new ApiError('Request timed out', 408, 'TIMEOUT'));
    }, timeout);
  });

  return Promise.race([promise, timeoutPromise]);
};

// Fetch wrapper with error handling
const apiFetch = async <T>(
  endpoint: string,
  options?: RequestInit & { timeout?: number }
): Promise<T> => {
  try {
    const response = await withTimeout(
      fetch(apiUrl(endpoint), options),
      options?.timeout || 30000
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || errorData.message || 'Request failed',
        response.status,
        errorData.code
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      'NETWORK_ERROR'
    );
  }
};

// API Service Object
export const apiService = {
  // Analyze Message
  analyzeMessage: async (
    request: AnalyzeMessageRequest
  ): Promise<APIResponse<AnalysisResult>> => {
    return apiFetch<APIResponse<AnalysisResult>>('/analyze/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  // Analyze URL
  analyzeURL: async (
    request: AnalyzeURLRequest
  ): Promise<APIResponse<AnalysisResult>> => {
    return apiFetch<APIResponse<AnalysisResult>>('/analyze/url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  // Analyze Screenshot
  analyzeScreenshot: async (
    request: AnalyzeScreenshotRequest
  ): Promise<APIResponse<AnalysisResult>> => {
    return apiFetch<APIResponse<AnalysisResult>>('/analyze/screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      timeout: 60000, // Screenshot analysis may take longer
    });
  },

  // Analyze Page (HTML)
  analyzePage: async (html: string): Promise<APIResponse<AnalysisResult>> => {
    return apiFetch<APIResponse<AnalysisResult>>('/analyze/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html }),
    });
  },

  // Analyze QR Code
  analyzeQR: async (qrData: string): Promise<APIResponse<AnalysisResult>> => {
    return apiFetch<APIResponse<AnalysisResult>>('/analyze/qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrData }),
    });
  },

  // Get History
  getHistory: async (limit: number = 50): Promise<APIResponse<HistoryItem[]>> => {
    return apiFetch<APIResponse<HistoryItem[]>>(`/history?limit=${limit}`);
  },

  // Get specific analysis by ID
  getAnalysis: async (analysisId: string): Promise<APIResponse<AnalysisResult>> => {
    return apiFetch<APIResponse<AnalysisResult>>(`/history/${analysisId}`);
  },

  // Delete history item
  deleteHistoryItem: async (id: string): Promise<APIResponse<{ success: boolean }>> => {
    return apiFetch<APIResponse<{ success: boolean }>>(`/history/${id}`, {
      method: 'DELETE',
    });
  },

  // Get Dashboard Metrics
  getDashboardMetrics: async (): Promise<APIResponse<DashboardMetrics>> => {
    return apiFetch<APIResponse<DashboardMetrics>>('/dashboard/metrics');
  },

  // Health check
  healthCheck: async (): Promise<APIResponse<{ status: string }>> => {
    return apiFetch<APIResponse<{ status: string }>>('/health');
  },

  // Check if backend is available
  checkBackend: async (): Promise<boolean> => {
    try {
      const response = await apiService.healthCheck();
      return response.success && response.data?.status === 'ok';
    } catch {
      return false;
    }
  },
};

// Hook for using API in components
export const useApi = () => {
  return apiService;
};

export default apiService;
