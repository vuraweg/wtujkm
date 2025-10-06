// src/components/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import {
  FileText,
  PlusCircle,
  Target,
  ArrowRight,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Star,
  Users,
  Zap,
  Award,
  Crown,
  Instagram,
  Linkedin,
  MessageCircle,
  Check,
  Plus,
  ChevronDown,
  ChevronUp,
  Briefcase
} from 'lucide-react';
// Assuming these imports exist in the user's project
// import { paymentService } from '../../services/paymentService';

// Mocking the imported functions and types for a self-contained example.
// In a real application, these would be external.
const paymentService = {
  // A mock service for payment-related functions
};

// Define the type for a feature object for clarity and type-safety
interface Feature {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  requiresAuth: boolean;
  highlight?: boolean; // Added highlight property
  gradient: string; // Added gradient property
}

interface HomePageProps {
  // REMOVED: onPageChange: (page: string) => void;
  isAuthenticated: boolean;
  onShowAuth: () => void;
  onShowSubscriptionPlans: (featureId?: string, expandAddons?: boolean) => void;
  onShowSubscriptionPlansDirectly: () => void; // NEW PROP
  userSubscription: any; // New prop for user's subscription status
}

import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../../contexts/AuthContext'; // ADDED: Import useAuth
import { authService } from '../../services/authService'; // ADDED: Import authService

export const HomePage: React.FC<HomePageProps> = ({
  // REMOVED: onPageChange,
  isAuthenticated,
  onShowAuth,
  onShowSubscriptionPlans,
  onShowSubscriptionPlansDirectly, // NEW PROP
  userSubscription // Destructure new prop
}) => {
  const [showOptimizationDropdown, setShowOptimizationDropdown] = React.useState(false);
  const [showPlanDetails, setShowPlanDetails] = React.useState(false); // New state for the dropdown
  const navigate = useNavigate(); // Initialize useNavigate
  const { user } = useAuth(); // ADDED: Access user from AuthContext
  const [globalResumesCreated, setGlobalResumesCreated] = useState<number>(50000);

  // Fetch global resumes created count on component mount
  useEffect(() => {
    const fetchGlobalCount = async () => {
      try {
        const count = await authService.getGlobalResumesCreatedCount();
        setGlobalResumesCreated(count);
      } catch (error) {
        console.error('HomePage: Error fetching global resumes count:', error);
        // Keep default value of 50000 if fetch fails
      }
    };

    fetchGlobalCount();
  }, []);

  // Helper function to get plan icon based on icon string
  const getPlanIcon = (iconType: string) => {
    switch (iconType) {
      case 'crown': return <Crown className="w-6 h-6" />;
      case 'zap': return <Zap className="w-6 h-6" />;
      case 'rocket': return <Award className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  // Helper function to check if a feature is available based on subscription
  const isFeatureAvailable = (featureId: string) => {
    if (!isAuthenticated) return false; // Must be authenticated to check subscription
    if (!userSubscription) return false; // No active subscription

    switch (featureId) {
      case 'optimizer':
        return userSubscription.optimizationsTotal > userSubscription.optimizationsUsed;
      case 'score-checker':
        return userSubscription.scoreChecksTotal > userSubscription.scoreChecksUsed;
      case 'guided-builder':
        return userSubscription.guidedBuildsTotal > userSubscription.guidedBuildsUsed;
      case 'linkedin-generator':
        return userSubscription.linkedinMessagesTotal > userSubscription.linkedinMessagesUsed;
      default:
        return false;
    }
  };

  const handleFeatureClick = (feature: Feature) => {
    console.log('Feature clicked:', feature.id);
    console.log('Feature requiresAuth:', feature.requiresAuth);
    console.log('User isAuthenticated:', isAuthenticated);

    // If not authenticated, prompt to sign in first
    if (!isAuthenticated && feature.requiresAuth) {
      onShowAuth();
      return;
    }

    // If authenticated, check if credits are available. If not, show plan selection.
    if (isAuthenticated && feature.requiresAuth && !isFeatureAvailable(feature.id)) {
      onShowSubscriptionPlans(feature.id); // Pass feature ID for context-specific modal
      return;
    }

    // If authenticated or feature does not require auth, navigate to the page.
    if (isAuthenticated || !feature.requiresAuth) { // Allow non-auth features to navigate
      console.log('User is authenticated or feature does not require auth. Navigating to page.');
      navigate(feature.id); // Use navigate
    }
  };


  const features: Feature[] = [
    {
      id: 'optimizer',
      title: 'JD-Based Optimizer',
      description: 'Upload your resume and a job description to get a perfectly tailored resume.',
      icon: <Target className="w-6 h-6" />,
      requiresAuth: false,
      highlight: true, // Highlight this feature
      gradient: 'from-blue-50 to-purple-50', // Added gradient
    },
    {
      id: 'score-checker',
      title: 'Resume Score Check',
      description: 'Get an instant ATS score with detailed analysis and improvement suggestions.',
      icon: <TrendingUp className="w-6 h-6" />,
      requiresAuth: false,
      gradient: 'from-green-50 to-emerald-50', // Added gradient
    },
    {
      id: 'guided-builder',
      title: 'Guided Resume Builder',
      description: 'Create a professional resume from scratch with our step-by-step AI-powered builder.',
      icon: <PlusCircle className="w-6 h-6" />,
      requiresAuth: false,
      gradient: 'from-orange-50 to-red-50', // Added gradient
    },
    
    {
      id: 'linkedin-generator',
      // MODIFIED LINE 100: Changed title
      title: 'Outreach Message Generator',
      // MODIFIED LINE 101: Changed description
      description: 'Generate personalized messages for networking, referrals, and cold outreach.',
      icon: <MessageCircle className="w-6 h-6" />,
      requiresAuth: true,
      gradient: 'from-yellow-50 to-amber-50', // Added gradient
    }
    ,
    {
      id: '/jobs',
      title: 'Explore Jobs',
      description: 'Discover job opportunities and apply with AI-optimized resumes.',
      icon: <Briefcase className="w-6 h-6" />,
      requiresAuth: false,
      highlight: false,
      gradient: 'from-indigo-50 to-purple-50',
    }
  ];

  const stats = [
    {
      number: globalResumesCreated.toLocaleString(),
      label: 'Resumes Created', 
      icon: <FileText className="w-5 h-5" />, 
      microcopy: 'Trusted by thousands of job seekers worldwide' 
    },
    { number: '95%', label: 'Success Rate', icon: <TrendingUp className="w-5 h-5" />, microcopy: 'Achieved by our AI-driven approach' },
    { number: '4.9/5', label: 'User Rating', icon: <Star className="w-5 h-5" />, microcopy: 'From satisfied professionals worldwide' },
    { number: '24/7', label: 'AI Support', icon: <Sparkles className="w-5 h-5" />, microcopy: 'Instant assistance whenever you need it' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-inter dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Visuals */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-neon-cyan-500/10 dark:to-neon-purple-500/10"></div>
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob dark:bg-neon-purple-500"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 dark:bg-neon-blue-500"></div>
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 dark:bg-neon-cyan-500"></div>


        <div className="relative container-responsive py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo and Brand */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-xl mr-4">
                <img
                  src="https://res.cloudinary.com/dlkovvlud/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1751536902/a-modern-logo-design-featuring-primoboos_XhhkS8E_Q5iOwxbAXB4CqQ_HnpCsJn4S1yrhb826jmMDw_nmycqj.jpg"
                  alt="PrimoBoost AI Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  PrimoBoost AI
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Resume Intelligence</p>
              </div>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              Your Dream Job Starts with a
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-neon-cyan-400 dark:to-neon-blue-400">
                Perfect Resume
              </span>
            </h2>

            {/* Subheadline Readability */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Choose your path to success. Whether you're building from scratch, <br /> optimizing for specific jobs, or just want to check your current resume score - we've got you covered.
            </p>

            {/* Hero CTA Button */}
            <button
              onClick={() => navigate('/optimizer')}
              className="btn-primary px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mb-12"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              Start Building My Resume
             
            </button>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg transition-all duration-300 border border-white/50 dark:bg-dark-100/80 dark:border-dark-300/50 dark:hover:shadow-neon-cyan/20"
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 sm:p-3 rounded-full dark:from-neon-cyan-500 dark:to-neon-blue-500 dark:shadow-neon-cyan">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                  {stat.microcopy && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.microcopy}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Features Section - Now with a consolidated frame */}
      <div className="container-responsive py-12 sm:py-16 bg-primary-50 dark:bg-dark-100">
        <div className="mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
            Choose Your Resume Journey
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            let remainingCount: number | null = null;
            if (isAuthenticated && userSubscription) {
              switch (feature.id) {
                case 'optimizer':
                  remainingCount = userSubscription.optimizationsTotal - userSubscription.optimizationsUsed;
                  break;
                case 'score-checker':
                  remainingCount = userSubscription.scoreChecksTotal - userSubscription.scoreChecksUsed;
                  break;
                case 'guided-builder':
                  remainingCount = userSubscription.guidedBuildsTotal - userSubscription.guidedBuildsUsed;
                  break;
                case 'linkedin-generator':
                  remainingCount = userSubscription.linkedinMessagesTotal - userSubscription.linkedinMessagesUsed;
                  break;
                default:
                  remainingCount = null;
              }
            }

            return (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature)} // Pass the full feature object
                className={`relative card-hover p-6 flex flex-col items-start sm:flex-row sm:items-center justify-between transition-all duration-300 bg-gradient-to-br ${feature.gradient} border border-secondary-100 shadow-lg hover:shadow-xl group rounded-2xl dark:from-dark-100 dark:to-dark-200 dark:border-dark-300 dark:hover:shadow-neon-cyan/20 ${feature.requiresAuth && !isAuthenticated ? 'opacity-70 cursor-not-allowed' : ''} ${feature.highlight ? 'ring-2 ring-green-500 ring-offset-4 overflow-visible' : ''}`}
              >
                {feature.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      <Check className="w-3 h-3 mr-1" /> Recommended
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-100 rounded-xl p-3 group-hover:bg-gradient-to-r group-hover:from-neon-cyan-500 group-hover:to-neon-blue-500 group-hover:text-white transition-all duration-300 shadow-sm flex-shrink-0 group-hover:scale-110 dark:bg-dark-200 dark:group-hover:shadow-neon-cyan">
                    {React.cloneElement(feature.icon, { className: "w-8 h-8" })}
                  </div>
                  <div>
                    <span className="text-lg font-bold text-secondary-900 dark:text-gray-100">{feature.title}</span>
                    <p className="text-sm text-secondary-700 dark:text-gray-300">{feature.description}</p>
                  {isAuthenticated && userSubscription && remainingCount !== null && remainingCount > 0 &&
 feature.id !== 'guided-builder' && feature.id !== 'linkedin-generator' && (
  <p className="text-xs font-medium text-green-600 dark:text-neon-cyan-400 mt-1">
    {remainingCount} remaining
  </p>
)}

                  </div>
                </div>
                <ArrowRight className={`w-6 h-6 text-secondary-400 group-hover:text-neon-cyan-400 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0 dark:text-gray-500 dark:group-hover:text-neon-cyan-400 ${feature.requiresAuth && !isAuthenticated ? 'opacity-50' : ''}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimalist Plans Section */}
      {isAuthenticated && (
        <div className="bg-white py-16 dark:bg-dark-100">
          <div className="container-responsive">
            {/* New Dropdown for User's Plan Status */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="relative inline-block text-left w-full">
                <button
                  onClick={() => setShowPlanDetails(!showPlanDetails)}
                  className="w-full bg-slate-100 text-slate-800 font-semibold py-3 px-6 rounded-xl flex items-center justify-between shadow-sm hover:bg-slate-200 transition-colors dark:bg-dark-200 dark:text-gray-100 dark:hover:bg-dark-300"
                >
                  <span className="flex items-center">
                    <Sparkles className="w-5 h-5 text-indigo-500 mr-2 dark:text-neon-cyan-400" />
                    {userSubscription ? (
                      <span>
                        Optimizations Left:{' '}
                        <span className="font-bold">
                          {userSubscription.optimizationsTotal - userSubscription.optimizationsUsed}
                        </span>
                      </span>
                    ) : (
                      <span>No Active Plan. Upgrade to use all features.</span>
                    )}
                  </span>
                  {showPlanDetails ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
                </button>
                {showPlanDetails && (
                  <div className="absolute z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-100 dark:ring-dark-300 dark:shadow-dark-xl">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      {userSubscription ? (
                        <>
                          <div className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                            <p className="font-semibold">{userSubscription.name} Plan</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Details for your current subscription.</p>
                          </div>
                          <hr className="my-1 border-gray-100 dark:border-dark-300" />
                          <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <div className="flex justify-between items-center">
                              <span>Optimizations:</span>
                              <span className="font-medium">{userSubscription.optimizationsTotal - userSubscription.optimizationsUsed} / {userSubscription.optimizationsTotal}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Score Checks:</span>
                              <span className="font-medium">{userSubscription.scoreChecksTotal - userSubscription.scoreChecksUsed} / {userSubscription.scoreChecksTotal}</span>
                            </div>
                            
                          </div>
                        </>
                      ) : (
                        <div className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                          You currently don't have an active subscription.
                        </div>
                      )}
                      <div className="p-4 border-t border-gray-100 dark:border-dark-300">
                        <button
                          onClick={() => onShowSubscriptionPlans(undefined, true)}
                          className="w-full btn-primary py-2"
                        >
                          {userSubscription ? 'Upgrade Plan' : 'Choose Your Plan'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            
            <div className="text-center mt-12">
              <button
                onClick={onShowSubscriptionPlansDirectly} // MODIFIED: Call the new direct function
                className="btn-secondary px-8 py-3"
              >
                View All Plans & Add-ons
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Features Teaser */}
    <div className="bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 text-white py-16 px-4 sm:px-0 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200" >

        

        <div className="container-responsive text-left">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-pink-500 dark:text-neon-pink-400">
              Powered by Advanced AI Technology
            </h3>
            <p className="text-lg text-blue-100 dark:text-gray-300 mb-8">
              Our intelligent system understands ATS requirements, job market trends, and recruiter preferences to give you the competitive edge.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-neon-cyan-500/20 dark:shadow-neon-cyan">
                  <Zap className="w-8 h-8 text-yellow-400 dark:text-neon-cyan-400" />
                </div>
                <h4 className="font-semibold mb-3 text-lg text-yellow-300 dark:text-neon-cyan-400">AI-Powered Analysis</h4>
                <p className="text-blue-200 dark:text-gray-300 leading-relaxed">Advanced algorithms analyze and optimize your resume</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-neon-blue-500/20 dark:shadow-neon-blue">
                  <Award className="w-8 h-8 text-green-400 dark:text-neon-blue-400" />
                </div>
                <h4 className="font-semibold mb-3 text-lg text-yellow-300 dark:text-neon-blue-400">ATS Optimization</h4>
                <p className="text-blue-200 dark:text-gray-300 leading-relaxed">Ensure your resume passes all screening systems</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-neon-purple-500/20 dark:shadow-neon-purple">
                  <Users className="w-8 h-8 text-purple-400 dark:text-neon-purple-400" />
                </div>
                <h4 className="font-semibold mb-3 text-lg text-yellow-300 dark:text-neon-purple-400">Expert Approved</h4>
                <p className="text-blue-200 dark:text-gray-300 leading-relaxed">Formats trusted by recruiters worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white/80 backdrop-blur-sm dark:bg-dark-100/80 dark:border-dark-300">
        <div className="container-responsive py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} PrimoBoost AI. All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/primoboostai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-pink-600 hover:bg-pink-50 transition-colors dark:border-dark-300 dark:text-pink-400 dark:hover:bg-dark-200"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/primoboost-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-blue-700 hover:bg-blue-50 transition-colors dark:border-dark-300 dark:text-neon-cyan-400 dark:hover:bg-dark-200"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/0000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-green-600 hover:bg-green-50 transition-colors dark:border-dark-300 dark:text-green-400 dark:hover:bg-dark-200"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
