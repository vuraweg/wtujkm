// src/components/navigation/Navigation.tsx
import React, { useState } from "react";
import {
  Home,
  Info,
  Phone,
  BookOpen,
  MessageCircle,
  ChevronDown,
  Target,
  TrendingUp,
  PlusCircle,
  Users,
  Briefcase,
  FileText,
  Shield,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

interface NavigationProps {
  onPageChange: (path: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onPageChange }) => {
  const [showAIToolsDropdown, setShowAIToolsDropdown] = useState(false);
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { id: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
    { id: "/jobs", label: "Explore Jobs", icon: <Briefcase className="w-4 h-4" /> },
    { id: "/tutorials", label: "Tutorials", icon: <BookOpen className="w-4 h-4" /> },
  ];

  const dashboardItems = [
    { id: "/about", label: "About Us", icon: <Info className="w-4 h-4" /> },
    { id: "/careers", label: "Careers", icon: <Users className="w-4 h-4" /> },
    { id: "/contact", label: "Contact", icon: <Phone className="w-4 h-4" /> },
    ...(isAuthenticated
      ? [
          {
            id: "/jobs/applications",
            label: "My Applications",
            icon: <FileText className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  const aiTools = [
    { id: "/optimizer", label: "Resume Optimizer", icon: <Target className="w-4 h-4" /> },
    { id: "/score-checker", label: "Score Checker", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "/guided-builder", label: "Guided Builder", icon: <PlusCircle className="w-4 h-4" /> },
    { id: "/linkedin-generator", label: "LinkedIn Messages", icon: <MessageCircle className="w-4 h-4" /> },
  ];

  return (
    <nav className="hidden lg:flex items-center space-x-8">
      {navigationItems.map((item) => (
        <Link
          key={item.id}
          to={item.id}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            typeof window !== "undefined" && window.location.pathname === item.id
              ? "bg-blue-100 text-blue-700 shadow-md dark:bg-neon-cyan-500/20 dark:text-neon-cyan-300"
              : "text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-neon-cyan-400 dark:hover:bg-dark-200"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}

      {/* AI Tools */}
      {isAuthenticated && (
        <div className="relative">
          <button
            onClick={() => {
              setShowAIToolsDropdown(!showAIToolsDropdown);
              setShowDashboardDropdown(false);
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-neon-cyan-400 dark:hover:bg-dark-200 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Tools</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showAIToolsDropdown && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 dark:bg-dark-100 dark:border-dark-300">
              {aiTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.id}
                  onClick={() => setShowAIToolsDropdown(false)}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-dark-200 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {tool.icon}
                  <span className="font-medium">{tool.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dashboard */}
      <div className="relative">
        <button
          onClick={() => {
            setShowDashboardDropdown(!showDashboardDropdown);
            setShowAIToolsDropdown(false);
          }}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-neon-cyan-400 dark:hover:bg-dark-200 transition-all duration-200"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showDashboardDropdown && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 dark:bg-dark-100 dark:border-dark-300">
            {dashboardItems.map((item) => (
              <Link
                key={item.id}
                to={item.id}
                onClick={() => setShowDashboardDropdown(false)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-dark-200 transition-colors text-gray-700 dark:text-gray-300"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Admin Panel */}
      {isAuthenticated && user?.role === "admin" && (
        <Link
          to="/admin/jobs/new"
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20"
        >
          <Shield className="w-4 h-4" />
          <span>Admin Panel</span>
        </Link>
      )}
    </nav>
  );
};
