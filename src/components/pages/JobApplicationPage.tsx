import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Globe,
  ExternalLink,
  Sparkles,
  Send,
  Users,
  Calendar,
  Target,
  CheckCircle,
  Loader2,
  RefreshCw,
  Bot,
  Award,
  Code,
  Mail,
  Link as LinkIcon,
  Copy,
  ClipboardCheck,
  AlertCircle as AlertIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { JobListing } from '../../types/jobs';
import { Breadcrumb } from '../common/Breadcrumb';
import { generateCompanyDescription } from '../../services/geminiService';

export const JobApplicationPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [companyDescription, setCompanyDescription] = useState<string>('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) {
        setError('Job ID is missing');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('job_listings')
          .select('*')
          .eq('id', jobId)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Job not found');
          setLoading(false);
          return;
        }

        const jobData = data as JobListing;
        setJob(jobData);

        if (!jobData.company_description || jobData.company_description.trim() === '') {
          setCompanyDescription(`${jobData.company_name} is seeking talented individuals to join their team. This is an excellent opportunity to work with a dynamic organization and contribute to exciting projects.`);
        } else {
          setCompanyDescription(jobData.company_description);
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err instanceof Error ? err.message : 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleOptimizeResume = () => {
    if (!job) return;

    const fullJobDescription = [
      job.full_description || job.description,
      job.short_description ? `\n\nKey Points: ${job.short_description}` : '',
      job.qualification ? `\n\nQualifications: ${job.qualification}` : ''
    ].filter(Boolean).join('\n');

    navigate('/optimizer', {
      state: {
        jobId: job.id,
        jobDescription: fullJobDescription,
        roleTitle: job.role_title,
        companyName: job.company_name,
        fromJobApplication: true
      }
    });
  };

  const handleDirectApply = () => {
    if (!job) return;

    if (job.application_link && job.application_link.trim() !== '') {
      window.open(job.application_link, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/jobs/${job.id}/apply-form`);
    }
  };

  const generateDescription = async () => {
    if (!job) return;

    setGeneratingDescription(true);
    try {
      const description = await generateCompanyDescription({
        companyName: job.company_name,
        roleTitle: job.role_title,
        jobDescription: job.description,
        qualification: job.qualification,
        domain: job.domain,
        experienceRequired: job.experience_required
      });

      setCompanyDescription(description);

      const { error: updateError } = await supabase
        .from('job_listings')
        .update({
          company_description: description,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (updateError) {
        console.error('Error saving generated description:', updateError);
      }
    } catch (err) {
      console.error('Error generating description:', err);
      setError('Failed to generate company description. Please try again.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleGoBack = () => {
    navigate('/jobs');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-50 dark:to-dark-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-50 dark:to-dark-200 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Job Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'This job listing is no longer available'}</p>
          <button
            onClick={handleGoBack}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-50 dark:to-dark-200">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Breadcrumb
          items={[
            { label: 'Jobs', path: '/jobs' },
            { label: job.company_name, path: undefined },
            { label: job.role_title, path: undefined, isCurrentPage: true }
          ]}
          className="mb-6"
        />

        <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-8 border-b border-gray-200 dark:border-dark-300">
            {/* Updated Header with CTC + Apply Button */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div className="flex items-start space-x-4 mb-4 md:mb-0">
                {job.company_logo_url ? (
                  <div className="w-20 h-20 bg-white dark:bg-dark-200 rounded-xl border-2 border-gray-200 dark:border-dark-300 flex items-center justify-center p-3 shadow-lg">
                    <img
                      src={job.company_logo_url}
                      alt={`${job.company_name} logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {job.company_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{job.role_title}</h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">{job.company_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {formatPackage() && (
                  <div className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-5 py-2.5 rounded-xl text-lg font-bold shadow-md">
                    {formatPackage()}
                  </div>
                )}
                <button
                  onClick={() => {
                    const element = document.getElementById('application-method');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>

          {/* Rest of your Job Details (unchanged) */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">About the Company</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
              {companyDescription}
            </p>
          </div>
        </div>

        {/* Application Method Section */}
        <div id="application-method" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Choose Your Application Method
          </h2>
          {/* (Keep your existing two buttons section here) */}
        </div>
      </div>
    </div>
  );
};
