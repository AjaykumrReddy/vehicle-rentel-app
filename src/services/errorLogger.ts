import { getUserData } from '../utils/storage';
import api from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ERROR_QUEUE_KEY = 'error_queue';

interface ErrorLog {
  error_type: string;
  severity: string;
  source: string;
  error_message: string;
  error_code?: string;
  http_method?: string;
  http_status?: number;
  context_data?: any;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private errorQueue: ErrorLog[] = [];
  private isUploading = false;

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  async logError(error: {
    type: string;
    message: string;
    stack?: string;
    apiEndpoint?: string;
    requestData?: any;
    responseData?: any;
    userAction: string;
  }) {
    try {
      console.log('Logging error:', error)
      const userData = await getUserData();
      
      const errorLog: ErrorLog = {
        error_type: error.type,
        severity: 'HIGH',
        source: 'MOBILE_APP',
        error_message: error.message,
        error_code: error.stack ? 'RUNTIME_ERROR' : 'API_ERROR',
        http_method: error.apiEndpoint ? 'GET' : undefined,
        http_status: error.responseData?.status ? parseInt(error.responseData.status) : undefined,
        context_data: {
          timestamp: new Date().toISOString(),
          userId: userData?.id,
          platform: 'mobile',
          appVersion: '1.0.0',
          userAction: error.userAction,
          apiEndpoint: error.apiEndpoint,
          requestData: error.requestData,
          responseData: error.responseData,
          stackTrace: error.stack,
        },
      };

      // Add to RAM queue
      this.errorQueue.push(errorLog);
      
      // Save to persistent storage (survives app restart)
      await this.saveToStorage();
      
      // Try to upload immediately
      this.uploadErrors();
      
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  private async saveToStorage() {
    try {
      await AsyncStorage.setItem(ERROR_QUEUE_KEY, JSON.stringify(this.errorQueue));
    } catch (error) {
      console.error('Failed to save errors to storage:', error);
    }
  }

  private async loadFromStorage() {
    try {
      const stored = await AsyncStorage.getItem(ERROR_QUEUE_KEY);
      if (stored) {
        this.errorQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load errors from storage:', error);
    }
  }

  async initialize() {
    await this.loadFromStorage();
    this.uploadErrors(); // Try to upload any stored errors
  }

  private async uploadErrors() {
    if (this.isUploading || this.errorQueue.length === 0) return;

    try {
      this.isUploading = true;
      const errorsToUpload = [...this.errorQueue];
      console.log('Uploading errors:', errorsToUpload);
      await api.post('/errors/log-batch', errorsToUpload);
      
      // Clear uploaded errors from both RAM and storage
      this.errorQueue = [];
      await AsyncStorage.removeItem(ERROR_QUEUE_KEY);
      
    } catch (uploadError) {
      console.error('Failed to upload error logs:', uploadError);
      // Keep errors in queue for retry
    } finally {
      this.isUploading = false;
    }
  }
}

export const errorLogger = ErrorLogger.getInstance();