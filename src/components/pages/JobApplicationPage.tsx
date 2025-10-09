import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
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
  AlertCircle as AlertIcon,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { JobListing } from '../../types/jobs';
import { Breadcrumb } from '../common/Breadcrumb';
import { generateCompanyDescription } from '../../services/geminiService';

type HoverAction = 'optimize' | 'score' | 'apply';

interface HoverCardState {
  action: HoverAction | null;
  x: number;
  y: number;
}

interface HoverCardDetails {
  badge: string;
  title: string;
  description: string;
  benefits: string[];
  cautions: string[];
  icon: React.ElementType;
  tone: 'positive' | 'warning';
}

export const JobApplicationPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [companyDescription, setCompanyDescription] = useState<string>('');
  const [hoverCard, setHoverCard] = useState<HoverCardState>({ action: null, x: 0, y: 0 });

  const hoverCardContent: Record<HoverAction, HoverCardDetails> = {
    optimize: {
      badge: 'Recommended',
      title: 'Optimize Resume',
      description:
        'Tailor your resume to this role with AI-driven keyword alignment and recruiter-approved formatting.',
      benefits: [
        'Boosts your match score using targeted job keywords',
        'Refreshes bullet points for clarity, impact, and ATS readability'
      ],
      cautions: [
        'Consumes one optimization credit from your plan',
        'Allow about a minute for the tailored PDF to be ready'
      ],
      icon: Sparkles,
      tone: 'positive'
    },
    score: {
      badge: 'Quick Check',
      title: 'ATS Score Check',
      description:
        'Get an instant compatibility snapshot of your current resume against this exact job posting.',
      benefits: [
        'Highlights missing keywords you can fix immediately',
        'Shows how recruiters and ATS systems may rank your resume'
      ],
      cautions: [
        'Score accuracy depends on the resume file you upload',
        'Pair results with optimization for the highest shortlist chance'
      ],
      icon: Target,
      tone: 'positive'
    },
    apply: {
      badge: 'Heads up',
      title: 'Apply Directly',
      description: 'Skip the prep work and jump straight to the employer\'s application form.',
      benefits: [
        'Fastest route to submit your application today',
        'Useful when you already have a tailored resume on hand'
      ],
      cautions: [
        'Resume goes unchanged—lower odds of clearing ATS filters',
        'Double-check attachments and contact details before leaving this page'
      ],
      icon: AlertTriangle,
      tone: 'warning'
    }
  };

  const updateHoverCardPosition = (action: HoverAction, clientX: number, clientY: number) => {
    const offsetX = 24;
    const offsetY = -24;
    let x = clientX + offsetX;
    let y = clientY + offsetY;

    if (typeof window !== 'undefined') {
      const cardWidth = 320;
      const cardHeight = 220;
      const padding = 16;

      if (x + cardWidth > window.innerWidth - padding) {
        x = Math.max(padding, clientX - cardWidth - offsetX);
      }

      if (x < padding) {
        x = padding;
      }

      if (y < padding) {
        y = clientY + Math.abs(offsetY);
      }

      if (y + cardHeight > window.innerHeight - padding) {
        y = window.innerHeight - cardHeight - padding;
      }
    }

    setHoverCard({ action, x, y });
  };

  const handleHoverStart = (action: HoverAction) => (event: React.MouseEvent<HTMLElement>) => {
    updateHoverCardPosition(action, event.clientX, event.clientY);
  };

  const handleHoverMove = (action: HoverAction) => (event: React.MouseEvent<HTMLElement>) => {
    updateHoverCardPosition(action, event.clientX, event.clientY);
  };

  const handleFocusStart = (action: HoverAction) => (event: React.FocusEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    updateHoverCardPosition(action, centerX, rect.top);
  };

  const clearHoverCard = () => {
    setHoverCard((previous) => (previous.action ? { action: null, x: previous.x, y: previous.y } : previous));
  };

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

  const handleScoreCheck = () => {
    if (!job) return;

    const fullJobDescription = [
      job.full_description || job.description,
      job.short_description ? `\n\nKey Points: ${job.short_description}` : '',
      job.qualification ? `\n\nQualifications: ${job.qualification}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    navigate('/score-checker', {
      state: {
        jobDescription: fullJobDescription,
        jobTitle: job.role_title
      }
    });
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

  const activeHoverCard = hoverCard.action ? hoverCardContent[hoverCard.action] : null;
  const isWarningHover = activeHoverCard?.tone === 'warning';
  const ActiveHoverIcon = activeHoverCard?.icon;

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
    <>
      {activeHoverCard && ActiveHoverIcon && (
        <div
          className="fixed z-50 pointer-events-none transition-opacity duration-150"
          style={{ top: hoverCard.y, left: hoverCard.x }}
        >
          <div
            className={`w-72 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl ${
              isWarningHover
                ? 'bg-red-50/95 border-red-200 text-red-900 shadow-red-500/20 dark:bg-red-900/95 dark:border-red-700 dark:text-red-100'
                : 'bg-white/95 border-blue-100 text-gray-900 shadow-blue-500/10 dark:bg-slate-900/95 dark:border-slate-700 dark:text-gray-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className={`text-[11px] uppercase tracking-wide font-semibold ${
                    isWarningHover ? 'text-red-600 dark:text-red-300' : 'text-sky-600 dark:text-sky-300'
                  }`}
                >
                  {activeHoverCard.badge}
                </p>
                <h4 className="mt-1 text-lg font-bold">{activeHoverCard.title}</h4>
              </div>
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-xl ${
                  isWarningHover
                    ? 'bg-red-100/70 text-red-700 dark:bg-red-800/70 dark:text-red-100'
                    : 'bg-sky-100/80 text-sky-600 dark:bg-sky-800/60 dark:text-sky-100'
                }`}
              >
                <ActiveHoverIcon className="w-5 h-5" />
              </div>
            </div>
            <p
              className={`mt-2 text-sm leading-relaxed ${
                isWarningHover ? 'text-red-700 dark:text-red-100/90' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {activeHoverCard.description}
            </p>
            <div className="mt-3 space-y-2">
              {activeHoverCard.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className={`flex items-start gap-2 text-xs font-medium leading-snug ${
                    isWarningHover ? 'text-red-700 dark:text-red-100/90' : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <CheckCircle
                    className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                      isWarningHover ? 'text-red-500 dark:text-red-300' : 'text-emerald-500 dark:text-emerald-300'
                    }`}
                  />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            <div
              className={`mt-3 border-t pt-2 ${
                isWarningHover ? 'border-red-200/70 dark:border-red-700/60' : 'border-blue-100/70 dark:border-slate-700/60'
              }`}
            >
              <p
                className={`text-[11px] uppercase font-semibold tracking-wide ${
                  isWarningHover ? 'text-red-600 dark:text-red-300' : 'text-slate-500 dark:text-slate-300'
                }`}
              >
                Risks & reminders
              </p>
              <div className="mt-1 space-y-1">
                {activeHoverCard.cautions.map((item) => (
                  <div
                    key={item}
                    className={`flex items-start gap-2 text-xs leading-snug ${
                      isWarningHover ? 'text-red-700 dark:text-red-100/80' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <AlertIcon
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        isWarningHover ? 'text-red-500 dark:text-red-300' : 'text-amber-500 dark:text-amber-300'
                      }`}
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div className="flex items-start space-x-4 mb-4 md:mb-0">
                {job.company_logo_url ? (
                  <div className="w-20 h-20 bg-white dark:bg-dark-200 rounded-xl border-2 border-gray-200 dark:border-dark-300 flex items-center justify-center p-3 shadow-lg">
                    <img
                      src={job.company_logo_url}
                      alt={`${job.company_name} logo`}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">${job.company_name.charAt(0)}</div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {job.company_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {job.role_title}
                  </h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">
                    {job.company_name}
                  </p>
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
        const element = document.getElementById("application-method");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
    >
      Apply Now
    </button>
  </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium">{job.location_city || job.location_type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                  <p className="font-medium">{job.experience_required}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Work Type</p>
                  <p className="font-medium">{job.location_type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Posted</p>
                  <p className="font-medium">{new Date(job.posted_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <span>About the Company</span>
                
              </h2>
            
            </div>

            {generatingDescription ? (
              <div className="flex items-center space-x-3 py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <p className="text-gray-600 dark:text-gray-300">Generating company description with AI...</p>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
                {companyDescription}
              </p>
            )}

            {job.company_website && (
              <a
                href={job.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
              >
                <Globe className="w-5 h-5" />
                <span>Visit Company Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Job Description</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {job.qualification && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Qualifications</h3>
                <p className="text-gray-700 dark:text-gray-300">{job.qualification}</p>
              </div>
            )}
          </div>
        </div>

        {/* Referral Information Section */}
        {job.has_referral && (job.referral_person_name || job.referral_email || job.referral_code || job.referral_link) && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl shadow-lg border border-green-200 dark:border-green-800 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Referral Available!</h2>
                  <p className="text-green-100">Apply through employee referral for better chances</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {job.referral_person_name && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Referral Contact</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{job.referral_person_name}</p>
                    </div>
                  </div>
                )}

                {job.referral_email && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{job.referral_email}</p>
                        <button
                          onClick={() => {navigator.clipboard.writeText(job.referral_email || '');}}
                          className="text-green-600 hover:text-green-700 dark:text-green-400"
                          title="Copy email"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {job.referral_code && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Code className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Referral Code</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono font-bold text-lg text-green-600 dark:text-green-400">{job.referral_code}</p>
                        <button
                          onClick={() => {navigator.clipboard.writeText(job.referral_code || '');}}
                          className="text-green-600 hover:text-green-700 dark:text-green-400"
                          title="Copy code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {job.referral_link && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <LinkIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Referral Link</p>
                      <a
                        href={job.referral_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 dark:text-green-400 font-medium flex items-center space-x-1"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                {job.referral_bonus_amount && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Referral Bonus</p>
                      <p className="font-bold text-xl text-green-600 dark:text-green-400">₹{job.referral_bonus_amount.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {job.referral_terms && (
                <div className="mt-6 p-4 bg-white dark:bg-dark-100 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Terms & Conditions</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{job.referral_terms}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Patterns Section */}
        {(job.has_coding_test || job.has_aptitude_test || job.has_technical_interview || job.has_hr_interview) && (
          <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-lg border border-gray-200 dark:border-dark-300 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Selection Process</h2>
                  <p className="text-purple-100">Prepare for the following assessments</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {job.test_requirements && (
                <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{job.test_requirements}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {job.has_coding_test && (
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Coding Test</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Technical assessment</p>
                    </div>
                  </div>
                )}

                {job.has_aptitude_test && (
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Aptitude Test</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Logical reasoning</p>
                    </div>
                  </div>
                )}

                {job.has_technical_interview && (
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Technical Interview</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">In-depth discussion</p>
                    </div>
                  </div>
                )}

                {job.has_hr_interview && (
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">HR Interview</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cultural fit assessment</p>
                    </div>
                  </div>
                )}
              </div>

              {job.test_duration_minutes && (
                <div className="flex items-center space-x-2 p-4 bg-gray-50 dark:bg-dark-200 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Estimated Duration:</span> {job.test_duration_minutes} minutes ({Math.floor(job.test_duration_minutes / 60)}h {job.test_duration_minutes % 60}min)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div id="application-method" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Choose Your Application Method
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={handleOptimizeResume}
              onMouseEnter={handleHoverStart('optimize')}
              onMouseMove={handleHoverMove('optimize')}
              onMouseLeave={clearHoverCard}
              onFocus={handleFocusStart('optimize')}
              onBlur={clearHoverCard}
              className="group relative bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 hover:from-cyan-400 hover:via-blue-400 hover:to-blue-500 text-white rounded-2xl p-8 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 transform hover:scale-[1.02] text-left border-2 border-white/20 hover:border-white/40 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500 -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-300/20 rounded-full blur-2xl group-hover:bg-cyan-300/30 transition-all duration-500 translate-y-12 -translate-x-12"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg text-gray-900 animate-pulse">
                    ⭐ RECOMMENDED
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-3 drop-shadow-lg">Optimize Resume with AI</h3>
                <p className="text-cyan-50 mb-4 leading-relaxed text-sm">
                  Get your resume optimized specifically for this job using our AI-powered ATS scoring system. Increase your chances of getting shortlisted.
                </p>

                <ul className="space-y-2.5 mb-6">
                  <li className="flex items-start space-x-2 group/item">
                    <div className="mt-0.5 bg-white/20 rounded-full p-0.5">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    </div>
                    <span className="text-sm font-medium">ATS score analysis and optimization</span>
                  </li>
                   <li className="flex items-start space-x-2 group/item">
                    <div className="mt-0.5 bg-white/20 rounded-full p-0.5">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    </div>
                    <span className="text-sm font-medium">Higher chances of shortlisting</span>
                  </li>
                  <li className="flex items-start space-x-2 group/item">
                    <div className="mt-0.5 bg-white/20 rounded-full p-0.5">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    </div>
                    <span className="text-sm font-medium">Keyword matching for this specific job</span>
                  </li>
                  <li className="flex items-start space-x-2 group/item">
                    <div className="mt-0.5 bg-white/20 rounded-full p-0.5">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    </div>
                    <span className="text-sm font-medium">Download optimized resume PDF</span>
                  </li>
                   <li className="flex items-start space-x-2 group/item">
                    <div className="mt-0.5 bg-white/20 rounded-full p-0.5">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    </div>
                    <span className="text-sm font-medium">Recommended by hiring experts</span>
                  </li>
                </ul>

                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 group-hover:bg-white/20 transition-all duration-300">
                  <span className="font-bold text-base">Start Optimization</span>
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={handleDirectApply}
              onMouseEnter={handleHoverStart('apply')}
              onMouseMove={handleHoverMove('apply')}
              onMouseLeave={clearHoverCard}
              onFocus={handleFocusStart('apply')}
              onBlur={clearHoverCard}
              className="group bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  {job.application_link && job.application_link.trim() !== '' ? (
                    <ExternalLink className="w-8 h-8" />
                  ) : (
                    <Send className="w-8 h-8" />
                  )}
                </div>
                {job.application_link && job.application_link.trim() !== '' && (
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                    External Site
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-3">Apply Directly</h3>
              <p className="text-green-100 mb-4 leading-relaxed">
                {job.application_link && job.application_link.trim() !== ''
                  ? 'Apply directly on the company\'s career portal. You\'ll be redirected to their official application page.'
                  : 'Skip the optimization process and apply directly with your existing resume. Quick and straightforward application.'}
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-200" />
                  <span className="text-sm text-red-100">
                    Lower shortlist chances without optimization
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-200" />
                  <span className="text-sm text-red-100">
                    No ATS keyword alignment for this job
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-200" />
                  <span className="text-sm text-red-100">
                    Resume may miss recruiter screening filters
                  </span>
                </li>
              </ul>
              <button
                onClick={handleScoreCheck}
                onMouseEnter={(event) => {
                  event.stopPropagation();
                  updateHoverCardPosition('score', event.clientX, event.clientY);
                }}
                onMouseMove={(event) => {
                  event.stopPropagation();
                  updateHoverCardPosition('score', event.clientX, event.clientY);
                }}
                onMouseLeave={(event) => {
                  event.stopPropagation();
                  updateHoverCardPosition('apply', event.clientX, event.clientY);
                }}
                onFocus={(event) => {
                  event.stopPropagation();
                  handleFocusStart('score')(event);
                }}
                onBlur={(event) => {
                  event.stopPropagation();
                  clearHoverCard();
                }}
                className="w-full mb-4 bg-white/15 hover:bg-white/25 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-between backdrop-blur-sm"
              >
                <span>Check resume against this job (ATS Score)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Continue to Application</span>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
                  <Send className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
