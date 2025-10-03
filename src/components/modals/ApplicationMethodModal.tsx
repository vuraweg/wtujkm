import React from 'react';
import { X, ExternalLink, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { JobListing } from '../../types/jobs';

interface ApplicationMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobListing;
  onManualApply: () => void;
  onAIOptimizedApply: () => void;
}

export const ApplicationMethodModal: React.FC<ApplicationMethodModalProps> = ({
  isOpen,
  onClose,
  job,
  onManualApply,
  onAIOptimizedApply,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-dark-100 animate-fadeIn">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 dark:from-dark-200 dark:to-dark-300 p-6 border-b border-gray-200 dark:border-dark-400">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-white/50 dark:hover:bg-dark-100/50"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="pr-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Choose Your Application Method
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Select how you'd like to apply for <strong>{job.role_title}</strong> at{' '}
              <strong>{job.company_name}</strong>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Application Option */}
            <div className="group border-2 border-gray-200 dark:border-dark-300 rounded-2xl p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                    <ExternalLink className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                    Quick & Direct
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Apply Directly
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                  Submit your application directly on the company's career portal. You'll be
                  redirected to their website to complete the application process.
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Direct contact with hiring team
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Quick application process
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      No additional steps required
                    </span>
                  </div>
                </div>

                <button
                  onClick={onManualApply}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group-hover:scale-105"
                >
                  <span>Continue to Company Site</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* AI-Optimized Application Option */}
            <div className="group border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                    Recommended
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Use AI-Optimized Resume
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                  Let PrimoBoost AI tailor your resume specifically for this role. Our AI optimizes
                  your resume for ATS systems and highlights relevant skills.
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      ATS-optimized resume for this job
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      AI-enhanced for {job.domain} roles
                    </span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Keyword optimized for better ranking
                    </span>
                  </div>
                </div>

                <button
                  onClick={onAIOptimizedApply}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group-hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Optimize with AI</span>
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>💡 Tip:</strong> AI-optimized resumes have a{' '}
              <strong>3x higher chance</strong> of passing ATS screening and getting shortlisted
              for interviews.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
