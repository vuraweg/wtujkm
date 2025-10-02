// src/components/jobs/JobCard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Clock,
  GraduationCap,
  IndianRupee,
  ExternalLink,
  Zap,
  User,
  Calendar,
  Target,
  Briefcase,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { JobListing, AutoApplyResult, OptimizedResume } from '../../types/jobs';
import { jobsService } from '../../services/jobsService';
import { autoApplyOrchestrator } from '../../services/autoApplyOrchestrator';
import { profileResumeService } from '../../services/profileResumeService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface JobCardProps {
  job: JobListing;
  onManualApply: (job: JobListing, optimizedResume: OptimizedResume) => void;
  onAutoApply: (job: JobListing, result: AutoApplyResult) => void;
  isAuthenticated: boolean;
  onShowAuth: () => void;
  onCompleteProfile?: () => void; // NEW: Function to open profile management
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onManualApply,
  onAutoApply,
  isAuthenticated,
  onShowAuth,
  onCompleteProfile
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileValidation, setProfileValidation] = useState<{
    isComplete: boolean;
    missingFields: string[];
  } | null>(null);

  // Check profile completeness when component mounts (if authenticated)
  useEffect(() => {
    const checkProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const validation = await profileResumeService.isProfileCompleteForAutoApply(user.id);
          setProfileValidation(validation);
        } catch (err) {
          console.error('Error checking profile completeness:', err);
        }
      }
    };
    
    checkProfile();
  }, [isAuthenticated, user]);

  const handleManualApplyClick = () => {
    if (!isAuthenticated) {
      onShowAuth();
      return;
    }

    navigate(`/jobs/${job.id}/apply`);
  };

  const handleAutoApplyClick = async () => {
    if (!isAuthenticated || !user) {
      onShowAuth();
      return;
    }

    // Check if profile is complete for auto-apply
    if (!profileValidation?.isComplete) {
      setError(`Profile incomplete for auto-apply. Missing: ${profileValidation?.missingFields.join(', ') || 'profile data'}`);
      return;
    }

    setIsAutoApplying(true);
    setError(null);

    try {
      // Determine user type from profile
      const userType = await autoApplyOrchestrator.getUserTypeFromProfile(user.id);
      
      console.log('JobCard: Starting intelligent auto-apply process...');
      
      // Use the orchestrator for the complete auto-apply flow
      const orchestrationResult = await autoApplyOrchestrator.initiateAutoApply({
        jobId: job.id,
        userType: userType,
        userId: user.id
      });

      if (orchestrationResult.success && orchestrationResult.applicationResult) {
        onAutoApply(job, orchestrationResult.applicationResult);
      } else {
        throw new Error(orchestrationResult.error || 'Auto-apply orchestration failed');
      }
    } catch (err) {
      console.error('Auto-apply failed:', err);
      setError(err instanceof Error ? err.message : 'Auto-apply failed');
    } finally {
      setIsAutoApplying(false);
    }
  };

  const getLocationIcon = () => {
    switch (job.location_type) {
      case 'Remote':
        return <Globe className="w-4 h-4" />;
      case 'Onsite':
        return <Building2 className="w-4 h-4" />;
      case 'Hybrid':
        return <Target className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getDomainColor = (domain: string) => {
    const colors: { [key: string]: string } = {
      'SDE': 'from-blue-500 to-cyan-500',
      'Data Science': 'from-purple-500 to-pink-500',
      'Product': 'from-green-500 to-emerald-500',
      'Design': 'from-orange-500 to-red-500',
      'Marketing': 'from-yellow-500 to-amber-500',
      'Sales': 'from-indigo-500 to-blue-500',
    };
    return colors[domain] || 'from-gray-500 to-slate-500';
  };

  const formatPackage = () => {
    if (!job.package_amount || !job.package_type) return null;
    
    const amount = job.package_amount;
    let formattedAmount = '';
    
    if (amount >= 100000) {
      formattedAmount = `${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      formattedAmount = `${(amount / 1000).toFixed(0)}K`;
    } else {
      formattedAmount = amount.toString();
    }

    return `₹${formattedAmount} ${job.package_type}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden dark:bg-dark-100 dark:border-dark-300 dark:hover:shadow-neon-cyan/20"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-dark-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {job.company_logo_url ? (
              <div className="w-14 h-14 bg-white dark:bg-dark-200 rounded-lg border border-gray-200 dark:border-dark-300 flex items-center justify-center p-2">
                <img
                  src={job.company_logo_url}
                  alt={`${job.company_name} logo`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">${job.company_name.charAt(0)}</div>`;
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {job.company_name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                {job.role_title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {job.company_name}
              </p>
            </div>
          </div>
          {formatPackage() && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold dark:bg-green-900/20 dark:text-green-300">
              {formatPackage()}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDomainColor(job.domain)} text-white`}>
            {job.domain}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center dark:bg-blue-900/20 dark:text-blue-300">
            {getLocationIcon()}
            <span className="ml-1">{job.location_type}</span>
            {job.location_city && <span>, {job.location_city}</span>}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center dark:bg-purple-900/20 dark:text-purple-300">
            <Clock className="w-3 h-3 mr-1" />
            {job.experience_required}
          </span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {job.short_description}
        </p>
      </div>

      {/* Details */}
      <div className="p-6 bg-gray-50 dark:bg-dark-200">
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <GraduationCap className="w-4 h-4 mr-2" />
            <span>{job.qualification}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{new Date(job.posted_date).toLocaleDateString()}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-500/50">
            <div className="flex items-center text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {optimizedResume && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-500/50">
            <div className="flex items-center text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">
                Resume optimized! Score: {optimizedResume.optimization_score}/100
              </span>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleManualApplyClick}
            disabled={isOptimizing}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              isOptimizing
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>Manual Apply</span>
              </>
            )}
          </button>

          <button
            disabled={true}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 bg-gray-300 text-gray-600 cursor-not-allowed relative overflow-hidden dark:bg-gray-700 dark:text-gray-400"
            title="Feature launching soon"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Coming Soon</span>
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-bl-lg font-bold">SOON</div>
          </button>
        </div>
        
      </div>
    </motion.div>
  );
};
