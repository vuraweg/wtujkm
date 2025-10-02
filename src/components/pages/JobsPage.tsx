// src/components/pages/JobsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Sparkles,
  TrendingUp,
  Users,
  MapPin,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { JobListing, JobFilters, AutoApplyResult, OptimizedResume } from '../../types/jobs';
import { jobsService } from '../../services/jobsService';
import { JobCard } from '../jobs/JobCard';
import { JobFilters as JobFiltersComponent } from '../jobs/JobFilters';
import { OptimizedResumePreviewModal } from '../modals/OptimizedResumePreviewModal';
import { ApplicationConfirmationModal } from '../modals/ApplicationConfirmationModal';
import { AutoApplyProgressModal } from '../modals/AutoApplyProgressModal';

interface JobsPageProps {
  isAuthenticated: boolean;
  onShowAuth: () => void;
  onShowProfile?: (mode?: 'profile' | 'wallet') => void; // NEW: Function to open profile management
}

export const JobsPage: React.FC<JobsPageProps> = ({
  isAuthenticated,
  onShowAuth,
  onShowProfile // NEW: Destructure the new prop
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [filters, setFilters] = useState<JobFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // Modal states
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [showApplicationConfirmation, setShowApplicationConfirmation] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [selectedResume, setSelectedResume] = useState<OptimizedResume | null>(null);
  const [applicationResult, setApplicationResult] = useState<AutoApplyResult | null>(null);
  const [showAutoApplyProgress, setShowAutoApplyProgress] = useState(false);
  const [autoApplyApplicationId, setAutoApplyApplicationId] = useState<string | null>(null);

  const pageSize = 12;

  const loadJobs = useCallback(async (page = 0, newFilters = filters) => {
    setIsLoading(true);
    setError(null);

    try {
      const offset = page * pageSize;
      const result = await jobsService.getJobListings(newFilters, pageSize, offset);
      
      if (page === 0) {
        setJobs(result.jobs);
      } else {
        setJobs(prev => [...prev, ...result.jobs]);
      }
      
      setTotal(result.total);
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pageSize]);

  useEffect(() => {
    loadJobs(0, filters);
  }, [filters]);

  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadJobs(currentPage + 1);
    }
  };

  const handleManualApply = (job: JobListing, optimizedResume: OptimizedResume) => {
    setSelectedJob(job);
    setSelectedResume(optimizedResume);
    setShowResumePreview(true);
  };

  const handleAutoApply = (job: JobListing, result: AutoApplyResult) => {
    setSelectedJob(job);
    setApplicationResult(result);
    
    // If the auto-apply is still in progress, show progress modal
    if (result.status === 'pending' && result.applicationId) {
      setAutoApplyApplicationId(result.applicationId);
      setShowAutoApplyProgress(true);
    } else {
      // If completed (success or failure), show confirmation modal
      setShowApplicationConfirmation(true);
    }
  };

  const handleResumePreviewConfirm = () => {
    setShowResumePreview(false);
    if (selectedJob && selectedResume) {
      // Open job application link in new tab
      window.open(selectedJob.application_link, '_blank');
      
      // Show confirmation modal
      setApplicationResult({
        success: true,
        message: 'Manual application initiated',
        applicationId: selectedResume.id,
        status: 'submitted',
        resumeUrl: selectedResume.pdf_url
      });
      setShowApplicationConfirmation(true);
    }
  };

  const stats = [
    { label: 'Total Jobs', value: total, icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Remote Jobs', value: jobs.filter(j => j.location_type === 'Remote').length, icon: <MapPin className="w-5 h-5" /> },
    { label: 'Fresh Openings', value: jobs.filter(j => new Date(j.posted_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, icon: <Clock className="w-5 h-5" /> },
    { label: 'Companies', value: new Set(jobs.map(j => j.company_name)).size, icon: <Users className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-50 dark:to-dark-200 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 dark:bg-dark-50 dark:border-dark-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 py-3">
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-neon-cyan-500 to-neon-blue-500 text-white hover:from-neon-cyan-400 hover:to-neon-blue-400 py-3 px-5 rounded-xl inline-flex items-center space-x-2 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:block">Back to Home</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Explore Jobs</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover opportunities, apply with AI-optimized resumes, and track your applications all in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-4 text-center border border-gray-200 dark:bg-dark-100 dark:border-dark-300"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-8">
          <JobFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 dark:bg-red-900/20 dark:border-red-500/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Error Loading Jobs</h3>
                  <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
              <button
                onClick={() => loadJobs(0)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {!error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {jobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onManualApply={handleManualApply}
                  onAutoApply={handleAutoApply}
                  isAuthenticated={isAuthenticated}
                  onShowAuth={onShowAuth}
                  onCompleteProfile={() => onShowProfile && onShowProfile('profile')} // NEW: Pass profile completion handler
                />
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Loading jobs...</span>
              </div>
            )}

            {/* Load More Button */}
            {!isLoading && hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Load More Jobs
                </button>
              </div>
            )}

            {/* No More Jobs */}
            {!isLoading && !hasMore && jobs.length > 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-dark-200">
                  <CheckCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300">You've seen all available jobs</p>
              </div>
            )}

            {/* No Jobs Found */}
            {!isLoading && jobs.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-dark-200">
                  <Briefcase className="w-10 h-10 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Jobs Found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Try adjusting your filters or search terms to find more opportunities.
                </p>
                <button
                  onClick={() => setFilters({})}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <OptimizedResumePreviewModal
        isOpen={showResumePreview}
        onClose={() => setShowResumePreview(false)}
        job={selectedJob}
        optimizedResume={selectedResume}
        onConfirm={handleResumePreviewConfirm}
      />

      <ApplicationConfirmationModal
        isOpen={showApplicationConfirmation}
        onClose={() => setShowApplicationConfirmation(false)}
        job={selectedJob}
        result={applicationResult}
      />

      <AutoApplyProgressModal
        isOpen={showAutoApplyProgress}
        onClose={() => setShowAutoApplyProgress(false)}
        applicationId={autoApplyApplicationId}
        jobTitle={selectedJob?.role_title || ''}
        companyName={selectedJob?.company_name || ''}
        onComplete={(result) => {
          setShowAutoApplyProgress(false);
          setApplicationResult(result);
          setShowApplicationConfirmation(true);
        }}
      />
    </div>
  );
};