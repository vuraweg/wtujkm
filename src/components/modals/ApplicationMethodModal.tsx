import React, { useState } from "react";
import { Sparkles, Target, ExternalLink, Info } from "lucide-react";

type OptionKey = "optimize" | "score" | "direct";

interface PopupState {
  key: OptionKey;
  x: number;
  y: number;
}

export const ApplicationButtonsWithPopup: React.FC = () => {
  const [popup, setPopup] = useState<PopupState | null>(null);

  const showPopup = (key: OptionKey, e: React.MouseEvent<HTMLButtonElement>) => {
    const popupWidth = 260;
    const x = Math.min(e.clientX + 20, window.innerWidth - popupWidth - 20);
    const y = Math.max(e.clientY - 100, 20);
    setPopup({ key, x, y });
  };

  const hidePopup = () => setPopup(null);

  const buttonData = {
    optimize: {
      label: "Optimize Resume",
      gradient: "from-purple-600 to-pink-600",
      icon: <Sparkles className="w-5 h-5" />,
      popup: {
        title: "AI Optimization 🚀",
        text: "We rewrite your resume with hiring data & keywords. 9/10 candidates get faster shortlists!",
        border: "border-purple-300",
        textColor: "text-purple-600",
      },
    },
    score: {
      label: "Check ATS Score",
      gradient: "from-blue-500 to-cyan-500",
      icon: <Target className="w-5 h-5" />,
      popup: {
        title: "ATS Analyzer 📊",
        text: "Upload your resume & get instant ATS score, keyword gaps, and match percentage.",
        border: "border-blue-300",
        textColor: "text-blue-600",
      },
    },
    direct: {
      label: "Apply Directly",
      gradient: "from-red-500 to-orange-500",
      icon: <ExternalLink className="w-5 h-5" />,
      popup: {
        title: "Risky Move ⚠️",
        text: "Applying directly may skip recruiter filters. Optimize first to stay visible!",
        border: "border-red-300",
        textColor: "text-red-600",
      },
    },
  };

  return (
    <div className="relative flex flex-col items-center justify-center mt-10">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
        Choose How You Want to Apply
      </h3>

      <div className="flex flex-wrap gap-4 justify-center">
        {(Object.keys(buttonData) as OptionKey[]).map((key) => {
          const b = buttonData[key];
          return (
            <button
              key={key}
              onMouseEnter={(e) => showPopup(key, e)}
              onMouseLeave={hidePopup}
              onClick={() => alert(`${b.label} clicked`)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${b.gradient} shadow-md transition transform hover:scale-105 focus:outline-none`}
            >
              {b.icon}
              <span>{b.label}</span>
            </button>
          );
        })}
      </div>

      {popup && (
        <div
          className={`fixed z-50 pointer-events-none transition-all duration-150`}
          style={{ top: popup.y, left: popup.x }}
        >
          <div
            className={`w-64 p-4 bg-white dark:bg-dark-100 border ${buttonData[popup.key].popup.border} rounded-xl shadow-xl`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Info
                className={`w-4 h-4 ${buttonData[popup.key].popup.textColor}`}
              />
              <span
                className={`font-semibold ${buttonData[popup.key].popup.textColor}`}
              >
                {buttonData[popup.key].popup.title}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {buttonData[popup.key].popup.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
