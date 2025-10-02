// src/services/externalBrowserService.ts
import { AutoApplyRequest, AutoApplyResponse, FormAnalysisResult } from '../types/autoApply';

class ExternalBrowserService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    // These would be set via environment variables
    this.baseUrl = import.meta.env.VITE_EXTERNAL_BROWSER_SERVICE_URL || 'https://your-browser-service.com/api';
    this.apiKey = import.meta.env.VITE_EXTERNAL_BROWSER_API_KEY || 'your-api-key';
  }

  /**
   * Analyzes a job application form to understand its structure
   */
  async analyzeApplicationForm(applicationUrl: string): Promise<FormAnalysisResult> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Origin': 'primoboost-ai',
        },
        body: JSON.stringify({ url: applicationUrl }),
      });

      if (!response.ok) {
        throw new Error(`Form analysis failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing application form:', error);
      throw new Error('Failed to analyze application form structure');
    }
  }

  /**
   * Submits an auto-apply request to the external browser service
   */
  async submitAutoApply(request: AutoApplyRequest): Promise<AutoApplyResponse> {
    try {
      console.log('ExternalBrowserService: Submitting auto-apply request...');

      const response = await fetch(`${this.baseUrl}/auto-apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Origin': 'primoboost-ai',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(180000), // 3 minute timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Auto-apply request failed: ${response.status} - ${errorText}`);
      }

      const result: AutoApplyResponse = await response.json();
      console.log('ExternalBrowserService: Auto-apply completed:', result.success);

      return result;
    } catch (error) {
      console.error('Error in submitAutoApply:', error);
      throw error;
    }
  }

  /**
   * Gets the status of an ongoing auto-apply process
   */
  async getAutoApplyStatus(applicationId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    currentStep?: string;
    estimatedTimeRemaining?: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/auto-apply/status/${applicationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Origin': 'primoboost-ai',
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking auto-apply status:', error);
      throw error;
    }
  }

  /**
   * Cancels an ongoing auto-apply process
   */
  async cancelAutoApply(applicationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auto-apply/cancel/${applicationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Origin': 'primoboost-ai',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error canceling auto-apply:', error);
      return false;
    }
  }

  /**
   * Test connectivity to the external browser service
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Origin': 'primoboost-ai',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      return response.ok;
    } catch (error) {
      console.error('External browser service connection test failed:', error);
      return false;
    }
  }
}

export const externalBrowserService = new ExternalBrowserService();