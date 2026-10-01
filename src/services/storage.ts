// Local storage service for persisting non-sensitive data
import { HistoryItem, AnalysisResult } from '../types';

const STORAGE_PREFIX = 'vigil_';

// Storage keys
enum StorageKey {
  HISTORY = 'history',
  THEME = 'theme',
  LAST_SCAN_TYPE = 'last_scan_type',
  DISMISSED_NOTICES = 'dismissed_notices',
}

// Get storage key with prefix
const getKey = (key: StorageKey) => `${STORAGE_PREFIX}${key}`;

// Safe localStorage access
const safeGetItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const safeSetItem = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const safeRemoveItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

// History management
export const historyService = {
  // Save analysis to history (without sensitive content)
  saveToHistory: (result: AnalysisResult): HistoryItem => {
    const history = historyService.getHistory();
    
    const historyItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      analysisId: result.analysisId,
      scanType: result.scanType,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      confidence: result.confidence,
      timestamp: result.timestamp,
      preview: getPreviewText(result),
    };

    // Add to beginning and keep only last 50
    const updatedHistory = [historyItem, ...history].slice(0, 50);
    safeSetItem(getKey(StorageKey.HISTORY), updatedHistory);
    
    return historyItem;
  },

  // Get all history
  getHistory: (): HistoryItem[] => {
    return safeGetItem<HistoryItem[]>(getKey(StorageKey.HISTORY)) || [];
  },

  // Get single history item
  getHistoryItem: (id: string): HistoryItem | null => {
    const history = historyService.getHistory();
    return history.find(item => item.id === id) || null;
  },

  // Delete history item
  deleteHistoryItem: (id: string): boolean => {
    const history = historyService.getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    return safeSetItem(getKey(StorageKey.HISTORY), updatedHistory);
  },

  // Clear all history
  clearHistory: (): boolean => {
    return safeRemoveItem(getKey(StorageKey.HISTORY));
  },
};

// Get preview text for history item (without sensitive data)
function getPreviewText(result: AnalysisResult): string {
  if (result.scanType === 'url') {
    return result.rawInput || 'URL Analysis';
  }
  if (result.scanType === 'screenshot') {
    return 'Screenshot Analysis';
  }
  // For messages, truncate and sanitize
  const preview = result.rawInput || 'Message Analysis';
  return preview.length > 50 ? preview.substring(0, 50) + '...' : preview;
}

// Theme management
export const themeService = {
  getTheme: (): 'light' | 'dark' | 'system' => {
    const saved = safeGetItem<string>(getKey(StorageKey.THEME));
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  },

  setTheme: (theme: 'light' | 'dark' | 'system'): boolean => {
    return safeSetItem(getKey(StorageKey.THEME), theme);
  },

  // Get effective theme (respecting system preference)
  getEffectiveTheme: (): 'light' | 'dark' => {
    const saved = themeService.getTheme();
    if (saved === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return saved;
  },
};

// Notice dismissal
export const noticeService = {
  isDismissed: (noticeId: string): boolean => {
    const dismissed = safeGetItem<string[]>(getKey(StorageKey.DISMISSED_NOTICES)) || [];
    return dismissed.includes(noticeId);
  },

  dismissNotice: (noticeId: string): boolean => {
    const dismissed = safeGetItem<string[]>(getKey(StorageKey.DISMISSED_NOTICES)) || [];
    if (!dismissed.includes(noticeId)) {
      dismissed.push(noticeId);
      return safeSetItem(getKey(StorageKey.DISMISSED_NOTICES), dismissed);
    }
    return true;
  },
};

// Last scan type
export const scanTypeService = {
  getLastScanType: (): string | null => {
    return safeGetItem<string>(getKey(StorageKey.LAST_SCAN_TYPE));
  },

  setLastScanType: (scanType: string): boolean => {
    return safeSetItem(getKey(StorageKey.LAST_SCAN_TYPE), scanType);
  },
};

// Export all services
export const storageService = {
  history: historyService,
  theme: themeService,
  notices: noticeService,
  scanType: scanTypeService,
};

export default storageService;
