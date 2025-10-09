import React, { useState } from "react";
import { Sparkles, Target, ExternalLink, CheckCircle, AlertTriangle, Info } from "lucide-react";

type OptionKey = "optimize" | "score" | "direct";
interface PopupState { key: OptionKey; x: number; y: number; }

export const ApplicationMethodSection: React.FC = () => {
  const [popup, setPopup] = useState<PopupState | null>(null);

  const showPopup = (key: OptionKey, e: React.MouseEvent<HTMLButtonElement>) => {
    const popupWidth = 260;
    const x = Math.min(e.clientX + 20, window.innerWidth - popupWidth - 20);
    const y = Math.max(e.clientY - 80, 20);
    setPopup({ key, x, y });
  };

  const hidePopup = () => setPopup(null);

  const popupContent = {
    optimize: {
      title: "AI Optimization 🚀",
      text: "We rewrite your resume using real recruiter data and keywords. Boost your shortlist odds instantly.",
      color: "text-purple-600 border-purple-300",
    },
    score: {
      title: "ATS Score Check 📊",
      text: "Upload your resume to get instant ATS compatibility, keyword match %, and recruiter fit report.",
      color: "text-blue-600 border-blue-300",
    },
    direct: {
      title: "Risky Move ⚠️",
      text: "Direct applying may skip recruiter filters. Optimize first to ensure your resume passes ATS.",
      color: "text-red-600 border-red-300",
    },
  };

  return (
    <div className="flex flex-col items-center w-full mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Choose Your Application Method</h2>

      {/* Main Cards */}
      <div className="flex flex-wrap justify-center gap-6">
        {/* Optimize Resume Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-2xl shadow-lg w-[360px] transition hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-lg font-bold">Optimize Resume with AI</h3>
            </div>
            <span className="text-xs font-semibold bg-yellow-300 text-gray-800 px-2 py-0.5 rounded-full">
              RECOMMENDED
            </span>
          </div>
          <p className="text-sm text-blue-50 mb-3">
            Get your resume optimized specifically for this job using our AI-powered ATS scoring system.
          </p>
          <ul className="space-y-1 text-sm mb-4">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> ATS score analysis and optimization</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Higher chances of shortlisting</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Keyword matching for this job</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Download optimized resume PDF</li>
          </ul>
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">
            Start Optimization <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Apply Directly Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-2xl shadow-lg w-[360px] transition hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-6 h-6" />
              <h3 className="text-lg font-bold">Apply Directly</h3>
            </div>
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
              External Site
            </span>
          </div>
          <p className="text-sm text-green-50 mb-3">
            Apply directly on the company’s career portal. You’ll be redirected to their official site.
          </p>
          <ul className="space-y-1 text-sm mb-4">
            <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Lower chances of shortlisting</li>
            <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> No ATS keyword alignment</li>
            <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> May miss recruiter filters</li>
          </ul>
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700">
            Continue to Application <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Three Floating Buttons */}
      <div className="flex flex-wrap gap-4 mt-10 justify-center">
        {([
          { key: "optimize", label: "Optimize Resume", gradient: "from-purple-600 to-pink-600", icon: <Sparkles /> },
          { key: "score", label: "Check ATS Score", gradient: "from-blue-500 to-cyan-500", icon: <Target /> },
          { key: "direct", label: "Apply Directly", gradient: "from-red-500 to-orange-500", icon: <ExternalLink /> },
        ] as const).map(({ key, label, gradient, icon }) => (
          <button
            key={key}
            onMouseEnter={(e) => showPopup(key, e)}
            onMouseLeave={hidePopup}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${gradient} shadow-md hover:scale-105 transition`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Popup Spec Card */}
      {popup && (
        <div
          className="fixed z-50 pointer-events-none transition-all duration-150"
          style={{ top: popup.y, left: popup.x }}
        >
          <div
            className={`w-64 bg-white dark:bg-gray-800 border ${popupContent[popup.key].color} rounded-xl shadow-xl p-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4" />
              <h4 className={`font-semibold ${popupContent[popup.key].color}`}>
                {popupContent[popup.key].title}
              </h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {popupContent[popup.key].text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
