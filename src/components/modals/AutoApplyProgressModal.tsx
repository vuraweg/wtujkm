// src/components/modals/AutoApplyProgressModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Eye, Download, ExternalLink, Clock, Zap } from 'lucide-react';
import { AutoApplyResponse } from '../../types/autoApply';
import { externalBrowserService } from '../../services/externalBrowserService';

interface AutoApplyProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string | null;
  jobTitle: string;
  companyName: string;
  onComplete: (result: AutoApplyResponse) => void;
}

export const AutoApplyProgressModal: React.FC<AutoApplyProgressModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  jobTitle,
  companyName,
  onComplete
}) => {
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing...');
  const [result, setResult] = useState<AutoApplyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !applicationId) return;

    const pollStatus = async () => {
      try {
        const statusInfo = await externalBrowserService.getAutoApplyStatus(applicationId);
        setStatus(statusInfo.status);
        setProgress(statusInfo.progress || 0);
        setCurrentStep(statusInfo.currentStep || 'Processing...');

        if (statusInfo.status === 'completed' || statusInfo.status === 'failed') {
          // Fetch final result
          // This would typically come from your Edge Function or be passed directly
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error('Error polling auto-apply status:', err);
        setError('Failed to get application status');
        clearInterval(intervalId);
      }
    };

    // Poll every 2 seconds
    const intervalId = setInterval(pollStatus, 2000);
    
    // Initial poll
    pollStatus();

    return () => clearInterval(intervalId);
  }, [isOpen, applicationId]);

  const handleCancel = async () => {
    if (applicationId && status === 'processing') {
      try {
        await externalBrowserService.cancelAutoApply(applicationId);
        setStatus('failed');
        setCurrentStep('Cancelled by user');
      } catch (err) {
        console.error('Error canceling auto-apply:', err);
      }
    }
    onClose();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Loader2 className="w-8 h-8 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-8 h-8 text-red-600" />;
      default:
        return <Clock className="w-8 h-8 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
      case 'processing':
        return 'from-blue-50 to-indigo-50';
      case 'completed':
        return 'from-green-50 to-emerald-50';
      case 'failed':
        return 'from-red-50 to-pink-50';
      default:
        return 'from-gray-50 to-slate-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto dark:bg-dark-100">
        {/* Header */}
        <div className={`relative bg-gradient-to-r ${getStatusColor()} p-6 border-b border-gray-200 dark:border-dark-300`}>
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-white/50"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {getStatusIcon()}
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {status === 'pending' && 'Preparing Application...'}
              {status === 'processing' && 'Applying to Job...'}
              {status === 'completed' && 'Application Submitted!'}
              {status === 'failed' && 'Application Failed'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {jobTitle} at {companyName}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress Bar */}
          {(status === 'pending' || status === 'processing') && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-dark-300">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 text-center">
                {currentStep}
              </p>
            </div>
          )}

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {[
              { step: 'Analyzing application form', completed: progress > 10 },
              { step: 'Filling personal details', completed: progress > 30 },
              { step: 'Uploading resume', completed: progress > 60 },
              { step: 'Submitting application', completed: progress > 80 },
              { step: 'Capturing confirmation', completed: progress >= 100 }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  item.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${item.completed ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                  {item.step}
                </span>
              </div>
            ))}
          </div>

          {/* Results */}
          {status === 'completed' && result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 dark:bg-green-900/20 dark:border-green-500/50">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Application Successful!</h3>
              <p className="text-green-700 dark:text-green-400 text-sm mb-3">{result.message}</p>
              
              <div className="flex flex-wrap gap-2">
                {result.screenshotUrl && (
                  <a
                    href={result.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Screenshot</span>
                  </a>
                )}
                
                {result.redirectUrl && (
                  <a
                    href={result.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Application</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 dark:bg-red-900/20 dark:border-red-500/50">
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">Application Failed</h3>
              <p className="text-red-700 dark:text-red-400 text-sm mb-3">
                {error || 'The automated application process encountered an error.'}
              </p>
              <p className="text-red-600 dark:text-red-400 text-xs">
                You can try applying manually using the job's application link.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {status === 'processing' && (
              <button
                onClick={handleCancel}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Cancel Application
              </button>
            )}
            
            {(status === 'completed' || status === 'failed') && (
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};