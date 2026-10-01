// Mock API for development when backend is not available
// This provides realistic mock responses for testing the frontend

import {
  AnalysisResult,
  HistoryItem,
  DashboardMetrics,
  APIResponse,
  AnalyzeMessageRequest,
  AnalyzeURLRequest,
  AnalyzeScreenshotRequest,
  RiskLevel,
  Severity,
  IndicatorType,
} from '../types';

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Generate mock indicators based on scan type
const generateMockIndicators = (
  scanType: 'message' | 'url' | 'screenshot',
  riskLevel: RiskLevel
): any[] => {
  const indicators: any[] = [];

  // Common indicators for high risk
  if (riskLevel === 'HIGH') {
    if (scanType === 'message' || scanType === 'screenshot') {
      indicators.push({
        type: 'urgency' as IndicatorType,
        severity: 'high' as Severity,
        evidence: '"Act immediately or your account will be suspended"',
        explanation: 'The message uses urgent language to pressure you into acting without thinking.',
        riskContribution: 25,
      });

      indicators.push({
        type: 'credential_request' as IndicatorType,
        severity: 'critical' as Severity,
        evidence: 'Request for password and username',
        explanation: 'The message explicitly requests login credentials.',
        riskContribution: 35,
      });

      indicators.push({
        type: 'suspicious_url' as IndicatorType,
        severity: 'high' as Severity,
        evidence: 'https://account-verification-secure-bank.com/login',
        explanation: 'The URL uses a domain that mimics a legitimate bank but is not the official domain.',
        riskContribution: 20,
      });
    }

    if (scanType === 'url') {
      indicators.push({
        type: 'lookalike_domain' as IndicatorType,
        severity: 'high' as Severity,
        evidence: 'paypa1-security.com',
        explanation: 'The domain uses character substitution to mimic a legitimate service.',
        riskContribution: 30,
      });

      indicators.push({
        type: 'suspicious_parameters' as IndicatorType,
        severity: 'medium' as Severity,
        evidence: '?session=abc123&redirect=true',
        explanation: 'URL contains suspicious query parameters that may be used for tracking or redirection.',
        riskContribution: 15,
      });
    }

    if (scanType === 'screenshot') {
      indicators.push({
        type: 'fake_login' as IndicatorType,
        severity: 'critical' as Severity,
        evidence: 'Login form detected with non-HTTPS URL',
        explanation: 'The screenshot shows a login form but the page URL is not secure.',
        riskContribution: 30,
      });

      indicators.push({
        type: 'impersonation' as IndicatorType,
        severity: 'high' as Severity,
        evidence: 'Branding mimics major bank',
        explanation: 'The page uses colors and logos that imitate a legitimate financial institution.',
        riskContribution: 20,
      });
    }
  }

  // Indicators for suspicious
  if (riskLevel === 'SUSPICIOUS') {
    if (scanType === 'message') {
      indicators.push({
        type: 'urgency' as IndicatorType,
        severity: 'medium' as Severity,
        evidence: '"Please verify your account"',
        explanation: 'The message requests account verification, which may be legitimate or a scam.',
        riskContribution: 20,
      });

      indicators.push({
        type: 'suspicious_url' as IndicatorType,
        severity: 'medium' as Severity,
        evidence: 'https://bit.ly/verify-account',
        explanation: 'Shortened URLs can hide the true destination.',
        riskContribution: 15,
      });
    }

    if (scanType === 'url') {
      indicators.push({
        type: 'shortened_url' as IndicatorType,
        severity: 'medium' as Severity,
        evidence: 'bit.ly/abc123xyz',
        explanation: 'URL shortening services can obscure the true destination.',
        riskContribution: 20,
      });
    }

    if (scanType === 'screenshot') {
      indicators.push({
        type: 'qr_code' as IndicatorType,
        severity: 'medium' as Severity,
        evidence: 'QR code detected',
        explanation: 'QR codes can direct to malicious websites. Always verify the destination.',
        riskContribution: 15,
      });
    }
  }

  // Indicators for low risk
  if (riskLevel === 'LOW') {
    if (scanType === 'message') {
      indicators.push({
        type: 'impersonation' as IndicatorType,
        severity: 'low' as Severity,
        evidence: 'Mentions bank name',
        explanation: 'The message mentions a legitimate organization name, but no suspicious patterns detected.',
        riskContribution: 5,
      });
    }

    if (scanType === 'url') {
      indicators.push({
        type: 'https_missing' as IndicatorType,
        severity: 'low' as Severity,
        evidence: 'http://example.com',
        explanation: 'The URL uses HTTP instead of HTTPS, but this alone does not indicate malware.',
        riskContribution: 5,
      });
    }
  }

  return indicators;
};

// Generate mock recommendation
const generateMockRecommendation = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'HIGH':
      return 'Do not click the link or provide credentials. Verify the request through the organization\'s official website or app.';
    case 'SUSPICIOUS':
      return 'Verify the sender and destination independently before taking action.';
    case 'LOW':
      return 'No significant threats were detected, but continue to be cautious with unexpected requests.';
    default:
      return 'Review the evidence and use your judgment.';
  }
};

// Generate mock analysis result
const generateMockAnalysis = (
  scanType: 'message' | 'url' | 'screenshot',
  riskLevel: RiskLevel
): AnalysisResult => {
  const indicators = generateMockIndicators(scanType, riskLevel);
  const totalRisk = indicators.reduce((sum, i) => sum + i.riskContribution, 0);
  const riskScore = Math.min(100, totalRisk);

  return {
    analysisId: generateId(),
    riskScore,
    riskLevel,
    confidence: Math.random() > 0.5 ? 0.95 : 0.85,
    indicators,
    recommendation: generateMockRecommendation(riskLevel),
    scanType,
    timestamp: new Date().toISOString(),
    rawInput: getMockRawInput(scanType),
    ...(scanType === 'screenshot' && {
      imagePreview: '/placeholder-screenshot.png',
      ocrText: 'Sample OCR extracted text from the screenshot...',
      ocrConfidence: 0.92,
    }),
  };
};

// Get mock raw input based on scan type
function getMockRawInput(scanType: 'message' | 'url' | 'screenshot'): string {
  switch (scanType) {
    case 'message':
      return 'Your account has been compromised. Please click the link below to verify your identity immediately.';
    case 'url':
      return 'https://paypa1-security-verify.com/account/login';
    case 'screenshot':
      return 'Screenshot analysis';
    default:
      return '';
  }
}

// Mock API service
export const mockApiService = {
  analyzeMessage: async (
    request: AnalyzeMessageRequest
  ): Promise<APIResponse<AnalysisResult>> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Determine risk level based on content
    const content = request.content.toLowerCase();
    let riskLevel: RiskLevel = 'LOW';

    if (content.includes('password') || content.includes('login') || content.includes('urgent')) {
      riskLevel = 'HIGH';
    } else if (content.includes('verify') || content.includes('click') || content.includes('account')) {
      riskLevel = 'SUSPICIOUS';
    }

    return {
      success: true,
      data: generateMockAnalysis('message', riskLevel),
    };
  },

  analyzeURL: async (
    request: AnalyzeURLRequest
  ): Promise<APIResponse<AnalysisResult>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const url = request.url.toLowerCase();
    let riskLevel: RiskLevel = 'LOW';

    if (url.includes('paypa1') || url.includes('secure-bank') || url.includes('login-verify')) {
      riskLevel = 'HIGH';
    } else if (url.includes('bit.ly') || url.includes('tinyurl') || url.includes('verify')) {
      riskLevel = 'SUSPICIOUS';
    }

    return {
      success: true,
      data: generateMockAnalysis('url', riskLevel),
    };
  },

  analyzeScreenshot: async (
    _request: AnalyzeScreenshotRequest
  ): Promise<APIResponse<AnalysisResult>> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo purposes, alternate between risk levels
    const riskLevels: RiskLevel[] = ['HIGH', 'SUSPICIOUS', 'LOW'];
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];

    return {
      success: true,
      data: generateMockAnalysis('screenshot', riskLevel),
    };
  },

  analyzePage: async (_html: string): Promise<APIResponse<AnalysisResult>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: generateMockAnalysis('url', 'SUSPICIOUS'),
    };
  },

  analyzeQR: async (_qrData: string): Promise<APIResponse<AnalysisResult>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: generateMockAnalysis('url', 'HIGH'),
    };
  },

  getHistory: async (limit: number = 50): Promise<APIResponse<HistoryItem[]>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockHistory: HistoryItem[] = [
      {
        id: generateId(),
        analysisId: generateId(),
        scanType: 'message',
        riskScore: 85,
        riskLevel: 'HIGH',
        confidence: 0.92,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        preview: 'Suspicious bank message',
      },
      {
        id: generateId(),
        analysisId: generateId(),
        scanType: 'url',
        riskScore: 45,
        riskLevel: 'SUSPICIOUS',
        confidence: 0.88,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        preview: 'Shortened URL check',
      },
      {
        id: generateId(),
        analysisId: generateId(),
        scanType: 'screenshot',
        riskScore: 15,
        riskLevel: 'LOW',
        confidence: 0.95,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        preview: 'Login page screenshot',
      },
    ];

    return {
      success: true,
      data: mockHistory.slice(0, limit),
    };
  },

  getAnalysis: async (_analysisId: string): Promise<APIResponse<AnalysisResult>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: generateMockAnalysis('message', 'HIGH'),
    };
  },

  deleteHistoryItem: async (_id: string): Promise<APIResponse<{ success: boolean }>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      data: { success: true },
    };
  },

  getDashboardMetrics: async (): Promise<APIResponse<DashboardMetrics>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      data: {
        totalScans: 127,
        highRisk: 23,
        suspicious: 45,
        lowRisk: 59,
        recentScans: [
          {
            id: generateId(),
            analysisId: generateId(),
            scanType: 'message',
            riskScore: 85,
            riskLevel: 'HIGH',
            confidence: 0.92,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            preview: 'Bank verification message',
          },
          {
            id: generateId(),
            analysisId: generateId(),
            scanType: 'url',
            riskScore: 45,
            riskLevel: 'SUSPICIOUS',
            confidence: 0.88,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            preview: 'Payment link check',
          },
        ],
        riskDistribution: {
          LOW: 59,
          SUSPICIOUS: 45,
          HIGH: 23,
        },
        scanTypeDistribution: {
          message: 67,
          url: 42,
          screenshot: 18,
        },
      },
    };
  },

  healthCheck: async (): Promise<APIResponse<{ status: string }>> => {
    return {
      success: true,
      data: { status: 'ok' },
    };
  },

  checkBackend: async (): Promise<boolean> => {
    return false; // Mock backend is always available
  },
};

export default mockApiService;
