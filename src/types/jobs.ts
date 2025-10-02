// src/types/jobs.ts

export interface JobListing {
  id: string;
  company_name: string;
  company_logo_url?: string;
  company_website?: string;
  company_description?: string;
  role_title: string;
  package_amount?: number;
  package_type?: 'CTC' | 'stipend' | 'hourly';
  domain: string;
  location_type: 'Remote' | 'Onsite' | 'Hybrid';
  location_city?: string;
  experience_required: string;
  qualification: string;
  short_description: string;
  description: string;
  full_description: string;
  application_link: string;
  posted_date: string;
  source_api: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OptimizedResume {
  id: string;
  user_id: string;
  job_listing_id: string;
  resume_content: any; // ResumeData from existing types
  pdf_url?: string;
  docx_url?: string;
  optimization_score: number;
  created_at: string;
}

export interface ApplicationLog {
  application_id: string;
  job_id: string;
  company_name: string;
  role_title: string;
  application_date: string;
  application_method: 'manual' | 'auto';
  status: 'pending' | 'submitted' | 'failed';
  resume_pdf_url?: string;
  screenshot_url?: string;
  redirect_url?: string;
}

export interface JobFilters {
  domain?: string;
  location_type?: string;
  experience_required?: string;
  package_min?: number;
  package_max?: number;
  search?: string;
  sort_by?: 'posted_date' | 'package_amount' | 'company_name';
  sort_order?: 'asc' | 'desc';
}

export interface AutoApplyProfile {
  full_name: string;
  email_address: string;
  phone: string;
  education_details?: any;
  experience_details?: any;
  skills_details?: any;
  linkedin_profile_url?: string;
  github_profile_url?: string;
  resume_headline?: string;
  current_location?: string;
}

export interface AutoApplyResult {
  success: boolean;
  message: string;
  applicationId: string;
  status: 'submitted' | 'failed';
  screenshotUrl?: string;
  resumeUrl?: string;
  fallbackUrl?: string;
  error?: string;
}

export interface ApplicationHistory {
  applications: ApplicationLog[];
  stats: {
    total: number;
    manual: number;
    auto: number;
    submitted: number;
    pending: number;
    failed: number;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}