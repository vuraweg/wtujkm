// src/components/modals/ApplicationMethodModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Target,
  Info,
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

type OptionKey = 'optimize' | 'score' | 'direct';

type TooltipState = {
  key: OptionKey;
  x: number;
  y: number;
};

interface ActionDefinition {
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  badge?: string;
  badgeClass?: string;
  gradient: string;
  icon: React.ReactNode;
  ctaLabel: string;
  onAction: () => void;
  emphasis?: 'primary' | 'info' | 'danger';
}

export const ApplicationMethodModal: React.FC<ApplicationMethodModalProps> = ({
  isOpen,
  onClose,
  job,
  onManualApply,
  onAIOptimizedApply,
  onScoreCheck,
}) => {
  const [active, setActive] = useState<OptionKey>('optimize');
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const actions: Record<OptionKey, ActionDefinition> = useMemo(
    () => ({
      optimize: {
        title: 'Optimize Resume with AI',
        subtitle: 'Boost your shortlist chances',
        description:
          'Let PrimoBoost AI tailor your resume for this job. We rewrite bullets, add metrics, and match recruiter keywords.',
        highlights: [
          `ATS-ready formatting tuned for ${job.domain} roles`,
          `Keyword alignment with the ${job.role_title} job description`,
          'Instant access to optimized PDF and DOCX downloads',
        ],
        badge: 'Recommended',
        badgeClass:
          'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300',
        gradient: 'from-purple-600 to-pink-600',
        icon: (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl text-white">
            <Sparkles className="w-6 h-6" />
          </div>
        ),
        ctaLabel: 'Start Optimization',
        onAction: onAIOptimizedApply,
        emphasis: 'primary',
      },
      score: {
        title: 'Check ATS Score',
        subtitle: 'See where you stand',
        description:
          "Already have a resume ready? Benchmark it in seconds — get your ATS score, keyword match %, and improvement tips.",
        highlights: [
          'Detailed ATS score with keyword match percentage',
          'Identifies missing tools, skills & experience depth',
          'Best step before investing effort in optimization',
        ],
        badge: 'Smart Choice',
        badgeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        gradient: 'from-blue-500 to-cyan-500',
        icon: (
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl text-white">
            <Target className="w-6 h-6" />
          </div>
        ),
        ctaLabel: 'Check ATS Score',
        onAction: onScoreCheck,
        emphasis: 'info',
      },
      direct: {
        title: 'Apply Directly (Risky)',
        subtitle: 'Skip AI help — not advised',
        description:
          "This takes you straight to the company's portal without tailoring. Use only if your resume already beats ATS filters.",
        highlights: [
          'High rejection risk when keywords don’t match',
          'No feedback on missing skills or achievements',
          'Usually a wasted application if not optimized',
        ],
        badge: 'Use with Caution',
        badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        gradient: 'from-red-500 to-orange-500',
        icon: (
          <div className="bg-red-500/90 p-3 rounded-xl text-white">
            <ExternalLink className="w-6 h-6" />
          </div>
        ),
        ctaLabel: 'Continue to Company Site',
        onAction: onManualApply,
        emphasis: 'danger',
      },
    }),
    [job, onAIOptimizedApply, onManualApply, onScoreCheck]
  );

  // Reset tooltip when modal closed
  useEffect(() => {
    if (!isOpen) setTooltip(null);
  }, [isOpen]);

  // Tooltip near cursor
  const anchorTooltip = (key: OptionKey, e: React.MouseEvent<HTMLButtonElement>) => {
    const tooltipWidth = 260;
    const x = Math.min(e.clientX + 20, window.innerWidth - tooltipWidth - 20);
    const y = Math.max(e.clientY - 60, 20);
    setTooltip({ key, x, y });
  };

  const clearTooltip = () => setTooltip(null);

  const handleActionSwitch = (key: OptionKey) => setActive(key);

  if (!isOpen) return null;

  const tooltipCopy: Record<
    OptionKey,
    { title: string; body: string; iconClass: string; borderClass: string }
  > = {
    optimize: {
      title: 'AI Advantage 🚀',
      body: 'We rewrite your resume using real hiring data to double your shortlist odds. Try it risk-free!',
      iconClass: 'text-purple-500 dark:text-purple-300',
      borderClass:
        'border-purple-200 dark:border-purple-700 text-gray-700 dark:text-gray-200',
    },
    score: {
      title: 'Know Before You Apply 📊',
      body: 'Get your ATS score instantly — fix what recruiters really look for before you apply.',
      iconClass: 'text-blue-500 dark:text-blue-300',
      borderClass: 'border-blue-200 dark:border-blue-700 text-gray-700 dark:text-gray-200',
    },
    direct: {
      title: 'Proceed at Your Own Risk ⚠️',
      body: 'Skipping optimization lowers visibility. Try AI tuning first — it’s free and 10× smarter.',
      iconClass: 'text-red-500 dark:text-red-300',
      borderClass: 'border-red-200 dark:border-red-700 text-red-700 dark:text-red-300',
    },
  };

  const renderTooltipContent = (key: OptionKey) => {
    const data = tooltipCopy[key];
    return (
      <div
        className={`relative bg-white dark:bg-dark-100 border rounded-xl shadow-xl p-4 text-sm w-64 ${data.borderClass}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Info className={`w-4 h-4 ${data.iconClass}`} />
          <span className="font-semibold">{data.title}</span>
        </div>
        <p>{data.body}</p>
      </div>
    );
  };

  const renderDetailHero = (key: OptionKey) => {
    const action = actions[key];
    const wrapperClass =
      action.emphasis === 'danger'
        ? 'border-red-200 dark:border-red-700 bg-red-50/70 dark:bg-red-900/10'
        : action.emphasis === 'info'
        ? 'border-blue-200 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-900/10'
        : 'border-purple-200 dark:border-purple-700 bg-purple-50/70 dark:bg-purple-900/10';

    return (
      <div className={`rounded-2xl border p-6 transition-all duration-300 ${wrapperClass}`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {action.icon}
              <div>
                {action.badge && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-1 ${action.badgeClass}`}
                  >
                    {action.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{action.subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              {action.description}
            </p>
            <ul className="space-y-2">
              {action.highlights.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                >
                  {key === 'direct' ? (
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle
                      className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${
                        key === 'score'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-purple-600 dark:text-purple-400'
                      }`}
                    />
                  )}
                  {point}
                </li>
              ))}
            </ul>

            {/* Motivational captions */}
            {key === 'optimize' && (
              <p className="mt-4 text-xs text-purple-700 dark:text-purple-300">
                🚀 9/10 candidates who optimize first get interview calls within 3 days.
              </p>
            )}
            {key === 'score' && (
              <p className="mt-4 text-xs text-blue-700 dark:text-blue-300">
                📊 Benchmark first — fix gaps before applying blindly.
              </p>
            )}
            {key === 'direct' && (
              <p className="mt-4 text-xs text-red-600 dark:text-red-300">
                ⚠️ Risky move! Try AI Optimization to stand out safely.
              </p>
            )}
          </div>

          <div className="md:w-48 flex-shrink-0">
            <button
              onClick={action.onAction}
              className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                key === 'direct'
                  ? 'danger-hover bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : key === 'score'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {key === 'optimize' && <Sparkles className="w-5 h-5" />}
              {key === 'score' && <Target className="w-5 h-5" />}
              {key === 'direct' && <ExternalLink className="w-5 h-5" />}
              <span>{action.ctaLabel}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {tooltip && (
        <div
          className="fixed z-[70] pointer-events-none transition-all duration-200"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          {renderTooltipContent(tooltip.key)}
        </div>
      )}

      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-dark-100 animate-fadeIn">
          <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 dark:from-dark-200 dark:to-dark-300 p-6 border-b border-gray-200 dark:border-dark-400">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-white/50 dark:hover:bg-dark-100/50"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="pr-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Choose How You Want to Apply
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Decide how you want to approach <strong>{job.role_title}</strong> at{' '}
                <strong>{job.company_name}</strong>. Benchmark or optimize first for the
                best results.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {(Object.keys(actions) as OptionKey[]).map((key) => {
                const action = actions[key];
                const isActive = active === key;

                return (
                  <div key={key} className="relative">
                    <button
                      data-option={key}
                      type="button"
                      onMouseEnter={(e) => anchorTooltip(key, e)}
                      onMouseLeave={clearTooltip}
                      onFocus={(e) => anchorTooltip(key, e)}
                      onBlur={clearTooltip}
                      onClick={() => handleActionSwitch(key)}
                      className={`w-full rounded-xl border-2 px-4 py-4 text-left transition-all duration-300 flex items-center gap-3 backdrop-blur-sm bg-white/80 dark:bg-dark-200/80 ${
                        isActive
                          ? 'border-transparent shadow-lg ring-2 ring-offset-2 ring-purple-400 dark:ring-purple-500'
                          : 'border-gray-200 dark:border-dark-400 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      {action.icon}
                      <div>
                        {action.badge && (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-1 ${action.badgeClass}`}
                          >
                            {action.badge}
                          </span>
                        )}
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          {action.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {action.subtitle}
                        </p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {renderDetailHero(active)}

            <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Tip:</strong> Candidates who benchmark and optimize first see the
                highest shortlist rates. Use these tools before jumping to the company site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Add this in your global CSS or Tailwind file
// (if using Tailwind, extend animation in tailwind.config.js)
const styles = `
@keyframes pulse-danger {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
.danger-hover:hover {
  animation: pulse-danger 0.4s ease-in-out infinite alternate;
  box-shadow: 0 0 12px rgba(239,68,68,0.45);
}
`;
if (typeof document !== 'undefined' && !document.getElementById('danger-hover-style')) {
  const style = document.createElement('style');
  style.id = 'danger-hover-style';
  style.innerHTML = styles;
  document.head.appendChild(style);
}
