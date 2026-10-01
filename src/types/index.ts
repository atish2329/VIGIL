// Risk Levels
export type RiskLevel = 'LOW' | 'SUSPICIOUS' | 'HIGH';

// Severity levels for indicators
export type Severity = 'low' | 'medium' | 'high' | 'critical';

// Scan types
export type ScanType = 'message' | 'url' | 'screenshot';

// Analysis modes
export type AnalysisMode = 'message' | 'url' | 'screenshot';

// Indicator types
export type IndicatorType = 
  | 'suspicious_url'
  | 'urgency'
  | 'credential_request'
  | 'impersonation'
  | 'phishing'
  | 'fake_login'
  | 'payment_request'
  | 'social_engineering'
  | 'fake_support'
  | 'qr_code'
  | 'password_request'
  | 'otp_request'
  | 'financial_request'
  | 'reward_scam'
  | 'lookalike_domain'
  | 'shortened_url'
  | 'suspicious_parameters'
  | 'https_missing'
  | 'suspicious_path';

// Indicator interface
export interface Indicator {
  type: IndicatorType;
  severity: Severity;
  evidence: string;
  explanation: string;
  riskContribution: number;
}

// Analysis result interface
export interface AnalysisResult {
  analysisId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  indicators: Indicator[];
  recommendation: string;
  scanType: ScanType;
  timestamp: string;
  rawInput?: string;
  // For screenshot analysis
  imagePreview?: string;
  ocrText?: string;
  ocrConfidence?: number;
  qrDestinations?: string[];
}

// API Request types
export interface AnalyzeMessageRequest {
  content: string;
}

export interface AnalyzeURLRequest {
  url: string;
}

export interface AnalyzeScreenshotRequest {
  imageData: string; // base64 encoded
  fileName: string;
  mimeType: string;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// History item
export interface HistoryItem {
  id: string;
  analysisId: string;
  scanType: ScanType;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  timestamp: string;
  preview: string;
}

// Dashboard metrics
export interface DashboardMetrics {
  totalScans: number;
  highRisk: number;
  suspicious: number;
  lowRisk: number;
  recentScans: HistoryItem[];
  riskDistribution: Record<RiskLevel, number>;
  scanTypeDistribution: Record<ScanType, number>;
}

// Threat insight card
export interface ThreatInsight {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

// Loading step
export interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'completed' | 'error';
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: string;
  isRetryable: boolean;
}

// Upload file type
export interface UploadedFile {
  file: File;
  preview: string;
  fileName: string;
  mimeType: string;
  size: number;
}

// Vision analysis specific types
export interface DetectedRegion {
  id: string;
  type: string;
  text: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  riskLevel: Severity;
}

// Navigation items
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

// Card types
export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Step for How It Works
export interface WorkStep {
  number: string;
  title: string;
  description: string;
}

// Color scheme for risk levels
export const RiskLevelColors: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  LOW: {
    bg: 'bg-safe/10',
    text: 'text-safe',
    border: 'border-safe',
  },
  SUSPICIOUS: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning',
  },
  HIGH: {
    bg: 'bg-danger/10',
    text: 'text-danger',
    border: 'border-danger',
  },
};

// Severity colors
export const SeverityColors: Record<Severity, { bg: string; text: string; border: string }> = {
  low: {
    bg: 'bg-safe/10',
    text: 'text-safe',
    border: 'border-safe',
  },
  medium: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning',
  },
  high: {
    bg: 'bg-danger/10',
    text: 'text-danger',
    border: 'border-danger',
  },
  critical: {
    bg: 'bg-danger/20',
    text: 'text-danger',
    border: 'border-danger',
  },
};

// Default loading steps
export const DefaultLoadingSteps: LoadingStep[] = [
  { id: 'reading', label: 'Reading input', status: 'pending' },
  { id: 'extracting', label: 'Extracting relevant information', status: 'pending' },
  { id: 'checking', label: 'Checking security signals', status: 'pending' },
  { id: 'correlating', label: 'Correlating evidence', status: 'pending' },
  { id: 'calculating', label: 'Calculating risk', status: 'pending' },
];

// Risk score thresholds
export const RiskThresholds = {
  LOW: { min: 0, max: 29 },
  SUSPICIOUS: { min: 30, max: 59 },
  HIGH: { min: 60, max: 100 },
};

// Message types for scanner
export const MessageTypes = [
  'SMS',
  'Email',
  'WhatsApp',
  'Social Media',
  'Bank Message',
  'Delivery Message',
  'Job/Investment',
];

// URL analysis checks
export const URLChecks = [
  'Domain verification',
  'URL structure',
  'Suspicious parameters',
  'HTTPS status',
  'Lookalike domains',
  'Shortened URLs',
  'Suspicious paths',
  'Login indicators',
  'Domain characteristics',
];

// Screenshot analysis capabilities
export const ScreenshotChecks = [
  'OCR text extraction',
  'URL extraction',
  'Suspicious text detection',
  'Phishing indicators',
  'Credential requests',
  'Fake login pages',
  'Impersonation',
  'Suspicious visual elements',
  'QR code detection',
];
