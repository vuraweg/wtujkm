// src/components/payment/SubscriptionPlans.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { SubscriptionPlan } from '../../types/payment';
import { paymentService } from '../../services/paymentService';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface SubscriptionPlansProps {
  isOpen: boolean;
  onNavigateBack: () => void;
  onSubscriptionSuccess: () => void;
  onShowAlert: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'warning' | 'error',
    actionText?: string,
    onAction?: () => void
  ) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  isOpen,
  onNavigateBack,
  onSubscriptionSuccess,
  onShowAlert,
}) => {
  const { user } = useAuth();
  const plans = useMemo(() => paymentService.getPlans(), []);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    plans[0]?.id ?? null
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = 320; // approximate card width for smooth transition

  if (!isOpen) return null;

  const handleNext = () => {
    if (activeIndex < plans.length - 3) setActiveIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (activeIndex > 0) setActiveIndex((prev) => prev - 1);
  };

  const renderFeatureText = (feature: string) => {
    if (!feature) return feature;
    if (feature.startsWith('✅') || feature.startsWith('❌')) {
      const idx = feature.indexOf(' ');
      return idx > 0 ? feature.slice(idx + 1) : feature;
    }
    return feature;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-dark-100 dark:shadow-dark-xl">
        <button
          onClick={onNavigateBack}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-gray-500 transition hover:bg-white hover:text-gray-900"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <header className="border-b border-gray-100 bg-gradient-to-br from-indigo-100 via-blue-100 to-white px-6 py-10 text-center dark:border-dark-200 dark:from-dark-100 dark:via-dark-200 dark:to-dark-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 text-white shadow-lg">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-50">
            Choose Your Success Plan
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
            Pick the bundle that matches your job search pace.
          </p>
        </header>

        <main className="flex-1 overflow-hidden px-6 py-10">
          {/* Carousel */}
          <div className="relative flex items-center justify-center">
            {/* Left arrow */}
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition hover:bg-white ${
                activeIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>

            <div className="overflow-hidden w-full max-w-5xl">
              <motion.div
                className="flex gap-6"
                animate={{ x: `-${activeIndex * (cardWidth + 24)}px` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              >
                {plans.map((plan) => {
                  const isSelected = plan.id === selectedPlan;
                  return (
                    <motion.div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      whileHover={{ scale: 1.05 }}
                      className={`min-w-[${cardWidth}px] cursor-pointer flex-shrink-0 rounded-3xl p-6 text-center shadow-md transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 text-white scale-[1.03]'
                          : 'bg-white text-gray-900 dark:bg-dark-200 dark:text-gray-100'
                      }`}
                    >
                      <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
                      <p className="text-4xl font-extrabold mb-1">
                        {formatCurrency(plan.price)}
                      </p>
                      <p className="text-sm mb-3 opacity-80">
                        {plan.optimizations} Resume Credits
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-left">
                        {(plan.features || []).map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
                          >
                            <Check
                              className={`h-4 w-4 ${
                                isSelected ? 'text-white' : 'text-emerald-500'
                              }`}
                            />
                            {renderFeatureText(feature)}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold transition ${
                            isSelected
                              ? 'bg-white text-indigo-600 hover:bg-white/90'
                              : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Choose Plan'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Right arrow */}
            <button
              onClick={handleNext}
              disabled={activeIndex >= plans.length - 3}
              className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition hover:bg-white ${
                activeIndex >= plans.length - 3
                  ? 'opacity-40 cursor-not-allowed'
                  : ''
              }`}
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Bottom Buttons */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={onSubscriptionSuccess}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
