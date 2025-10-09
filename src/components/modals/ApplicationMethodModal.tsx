import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Target,
  Info
} from 'lucide-react';
import { JobListing } from '../../types/jobs';

interface ApplicationMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobListing;
  onManualApply: () => void;
  onAIOptimizedApply: () => void;
  onScoreCheck: () => void;
}

type HoverCard = 'optimize' | 'score' | 'direct' | null;

export const ApplicationMethodModal: React.FC<ApplicationMethodModalProps> = ({
  isOpen,
  onClose,
  job,
  onManualApply,
  onAIOptimizedApply,
  onScoreCheck,
}) => {
  const [hovered, setHovered] = useState<HoverCard>(null);

  if (!isOpen) return null;

  const renderHoverCard = (type: HoverCard) => {
    if (hovered !== type) return null;

    const styles =
      type === 'direct'
        ? 'border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
        : type === 'score'
          ? 'border-blue-200 dark:border-blue-700 text-gray-700 dark:text-gray-200'
          : 'border-purple-200 dark:border-purple-700 text-gray-700 dark:text-gray-200';

    const iconClass =
      type === 'direct'
        ? 'text-red-500 dark:text-red-300'
        : type === 'score'
          ? 'text-blue-500 dark:text-blue-300'
          : 'text-purple-500 dark:text-purple-300';

    const copyMap: Record<Exclude<HoverCard, null>, string> = {
      optimize:
        'Optimized resumes get past ATS filters faster. We rephrase content, enrich metrics, and align with keywords recruiters search for.',
      score:
        'See your ATS score, keyword match %, and missing skills. Perfect diagnosis step before investing time optimizing.',
      direct:
        'Applying without tuning often leads to silent rejection. Score or optimize first to avoid wasting the application.',
    };

    return (
      <div className="absolute inset-x-4 -top-20 hidden md:block">
        <div className={`bg-white dark:bg-dark-100 border rounded-xl shadow-xl p-4 text-sm ${styles}`}>
          <div className="flex items-center gap-2 mb-2">
            <Info className={`w-4 h-4 ${iconClass}`} />
            <span className="font-semibold">
              {type === 'optimize' && 'Why optimize first?'}
              {type === 'score' && 'What you learn'}
              {type === 'direct' && 'Before you continue'}
            </span>
          </div>
          <p>{copyMap[type]}</p>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-dark-100 animate-fadeIn">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 dark:from-dark-200 dark:to-dark-300 p-6 border-b border-gray-200 dark:border-dark-400">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-white/50 dark:hover:bg-dark-100/50"
            aria-label="Close application methods modal"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="pr-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Choose Your Application Method
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Decide how you want to approach <strong>{job.role_title}</strong> at{' '}
              <strong>{job.company_name}</strong>. We recommend preparing before you apply.
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Optimize with AI */}
            <div
              className="relative group border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50/70 to-pink-50/70 dark:from-purple-900/15 dark:to-pink-900/15 cursor-pointer"
              onMouseEnter={() => setHovered('optimize')}
              onMouseLeave={() => setHovered(null)}
            >
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
                  Optimize with AI
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                  Tailor your resume to beat ATS filters. We highlight relevant achievements and keywords for this specific job.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                    Crafted for {job.domain} roles with ATS-ready formatting
                  </div>
                  <div className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                    Aligns keywords with the {job.role_title} JD
                  </div>
                  <div className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                    Downloadable optimized PDF & DOCX
                  </div>
                </div>
                <button
                  onClick={onAIOptimizedApply}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group-hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Start Optimization</span>
                </button>
              </div>
              {renderHoverCard('optimize')}
            </div>

            {/* Score Against Job */}
            <div
              className="relative group border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50/70 to-cyan-50/70 dark:from-blue-900/15 dark:to-cyan-900/15 cursor-pointer"
              onMouseEnter={() => setHovered('score')}
              onMouseLeave={() => setHovered(null)}
              onClick={onScoreCheck}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                    Best Insight
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Score Against This Job
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                  Evaluate how well your current resume matches this job description. Spot gaps before you optimize or apply.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    Detailed ATS compatibility score
                  </div>
                  <div className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    Missing keywords & skills breakdown
                  </div>
                  <div className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    Ideal first step if you already have a resume
                  </div>
                </div>
                <button
                  onClick={onScoreCheck}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group-hover:scale-105"
                >
                  <Target className="w-5 h-5" />
                  <span>Check ATS Score</span>
                </button>
              </div>
              {renderHoverCard('score')}
            </div>

            {/* Apply Directly */}
            <div
              className="relative group border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 hover:border-red-500 dark:hover:border-red-500 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-red-50/70 to-orange-50/70 dark:from-red-900/15 dark:to-orange-900/15 cursor-pointer"
              onMouseEnter={() => setHovered('direct')}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-500/90 p-3 rounded-xl">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                    Least Recommended
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Apply Directly
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                  Jump straight to the company’s portal without tailoring your resume. Use only if you already scored or optimized.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-start text-sm text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    High rejection risk due to ATS mismatches
                  </div>
                  <div className="flex items-start text-sm text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    No insight into missing skills before applying
                  </div>
                  <div className="flex items-start text-sm text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    Likely a wasted application if resume isn’t tuned
                  </div>
                </div>
                <button
                  onClick={onManualApply}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group-hover:scale-105"
                >
                  <span>Continue to Company Site</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              {renderHoverCard('direct')}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Tip:</strong> Candidates who first score their resume and then optimize with AI see the highest shortlist rates. Use the insight flow before applying directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
