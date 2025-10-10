// src/components/payment/SubscriptionPlans.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  Plus,
  Sparkles,
  Wallet,
  X
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
  initialExpandAddons?: boolean;
}

type AddOnQuantityMap = Record<string, number>;

interface AppliedCoupon {
  code: string;
  discount: number;
  finalAmount: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

const planVisuals = {
  default: {
    cardBg: 'bg-white/90 backdrop-blur-sm text-gray-900 dark:bg-dark-100 dark:text-gray-100',
    shadow: 'shadow-[0_18px_36px_rgba(15,23,42,0.12)]',
    selectedRing: 'ring-4 ring-blue-200 dark:ring-emerald-400/40',
    badgeBg: 'bg-slate-100 text-slate-500',
    priceText: 'text-gray-900 dark:text-gray-50',
    mutedText: 'text-gray-500 dark:text-gray-300',
    featureIcon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
    button:
      'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200'
  },
  highlight: {
    cardBg: 'bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 text-white',
    shadow: 'shadow-[0_30px_45px_rgba(59,130,246,0.35)]',
    selectedRing: 'ring-4 ring-white/40',
    badgeBg: 'bg-white/20 text-white',
    priceText: 'text-white',
    mutedText: 'text-white/85',
    featureIcon: 'bg-white/15 text-white',
    button: 'bg-white text-indigo-600 hover:bg-white/90'
  }
};

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  isOpen,
  onNavigateBack,
  onSubscriptionSuccess,
  onShowAlert,
  initialExpandAddons
}) => {
  const { user } = useAuth();
  const plans = useMemo(() => paymentService.getPlans(), []);
  const planOrder = ['leader_plan', 'achiever_plan', 'accelerator_plan', 'starter_plan', 'kickstart_plan'];
  const plans = useMemo(() => {
    const ordered = paymentService.getPlans().slice().sort((a, b) => {
      const indexA = planOrder.indexOf(a.id);
      const indexB = planOrder.indexOf(b.id);
      return (indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA) - (indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB);
    });
    return ordered;
  }, []);
  const addOns = useMemo(() => paymentService.getAddOns(), []);

  const [selectedPlan, setSelectedPlan] = useState<string | null>(plans[0]?.id ?? null);
  const [currentStep, setCurrentStep] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [showAddOns, setShowAddOns] = useState(initialExpandAddons ?? false);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnQuantityMap>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!selectedPlan && plans.length > 0) {
      setSelectedPlan(plans[0].id);
    }
  }, [plans, selectedPlan]);

  useEffect(() => {
    if (user && isOpen) {
      fetchWalletBalance();
    }
  }, [user, isOpen]);

  const fetchWalletBalance = async () => {
    if (!user) return;
    setLoadingWallet(true);
    try {
      const { data: transactions, error } = await supabase
        .from('wallet_transactions')
        .select('amount, status')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching wallet balance:', error);
        return;
      }
      const completed = (transactions || []).filter((t: any) => t.status === 'completed');
      const balance = completed.reduce((sum: number, tr: any) => sum + parseFloat(tr.amount), 0) * 100;
      setWalletBalance(Math.max(0, balance));
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoadingWallet(false);
    }
  };

  if (!isOpen) return null;

  const selectedPlanData = plans.find((plan) => plan.id === selectedPlan);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      onShowAlert('Coupon Error', 'Please enter a coupon code.', 'warning');
      return;
    }
    if (!user) {
      onShowAlert('Authentication Required', 'Please sign in to apply a coupon.', 'error', 'Sign In', () => {});
      return;
    }

    const result = await paymentService.applyCoupon(selectedPlan, couponCode.trim(), user.id);
    if (result.isValid) {
      setAppliedCoupon({
        code: result.couponApplied!,
        discount: result.discountAmount,
        finalAmount: result.finalAmount
      });
      setCouponError('');
      onShowAlert('Coupon Applied!', result.message, 'success');
    } else {
      setAppliedCoupon(null);
      setCouponError(result.message);
      onShowAlert('Coupon Error', result.message, 'warning');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleAddOnQuantityChange = (addOnId: string, nextQuantity: number) => {
    setSelectedAddOns((prev) => {
      const safeQuantity = Math.max(0, nextQuantity);
      if (safeQuantity === 0) {
        const { [addOnId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [addOnId]: safeQuantity };
    });
  };

  const addOnsTotal = Object.entries(selectedAddOns).reduce((total, [addOnId, qty]) => {
    const addOn = paymentService.getAddOnById(addOnId);
    return total + (addOn ? addOn.price * 100 * qty : 0);
  }, 0);

  let planPrice = (selectedPlanData?.price || 0) * 100;
  if (appliedCoupon) {
    planPrice = appliedCoupon.finalAmount;
  }

  const walletDeduction = useWalletBalance ? Math.min(walletBalance, planPrice) : 0;
  const finalPlanPrice = Math.max(0, planPrice - walletDeduction);
  const grandTotal = finalPlanPrice + addOnsTotal;

  const handlePayment = async () => {
    if (!user || !selectedPlanData) return;
    setIsProcessing(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        onShowAlert('Authentication Required', 'Please log in to complete your purchase.', 'error', 'Sign In', () => {});
        setIsProcessing(false);
        return;
      }

      const accessToken = session.access_token;

      if (grandTotal === 0) {
        const result = await paymentService.processFreeSubscription(
          selectedPlan,
          user.id,
          appliedCoupon?.code,
          addOnsTotal,
          selectedAddOns,
          selectedPlanData.price * 100,
          walletDeduction
        );
        if (result.success) {
          await fetchWalletBalance();
          onSubscriptionSuccess();
          onShowAlert('Subscription Activated', 'Your plan has been activated.', 'success');
        } else {
          onShowAlert('Activation Failed', result.error || 'Failed to activate your plan. Please try again.', 'error');
        }
      } else {
        const result = await paymentService.processPayment(
          {
            planId: selectedPlan,
            amount: grandTotal,
            currency: 'INR'
          },
          user.email,
          user.name,
          accessToken,
          appliedCoupon?.code,
          walletDeduction,
          addOnsTotal,
          selectedAddOns
        );

        if (result.success) {
          await fetchWalletBalance();
          onSubscriptionSuccess();
          onShowAlert('Payment Successful', 'Your subscription has been activated.', 'success');
        } else {
          const message =
            result.error && result.error.includes('Payment cancelled by user')
              ? 'You cancelled the payment. Please try again if you wish to proceed.'
              : result.error || 'Payment processing failed. Please try again.';
          onShowAlert('Payment Failed', message, 'error');
        }
      }
    } catch (error) {
      console.error('Payment process error:', error);
      onShowAlert(
        'Payment Error',
        error instanceof Error ? error.message : 'An unexpected error occurred during payment.',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm dark:bg-black/80">
      <div className="relative flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-dark-100 dark:shadow-dark-xl">
        <button
          onClick={onNavigateBack}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-gray-500 transition hover:bg-white hover:text-gray-900 dark:bg-dark-200/70 dark:text-gray-400 dark:hover:bg-dark-200 dark:hover:text-gray-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <header className="border-b border-gray-100 bg-gradient-to-br from-indigo-100 via-blue-100 to-white px-6 py-12 text-center dark:border-dark-200 dark:from-dark-100 dark:via-dark-200 dark:to-dark-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 text-white shadow-lg">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-50 sm:text-4xl">
            {currentStep === 0 ? 'Choose Your Success Plan' : 'Confirm Your Order'}
          </h1>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            {currentStep === 0
              ? 'Pick the bundle that matches your job search pace.'
              : 'Review your selection and complete the checkout.'}
          </p>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
          {currentStep === 0 && (
            <>
              <div className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 px-4 sm:-mx-6 sm:px-6 lg:gap-8 add-scroll-x">
                {(() => {
                  const selectedIdx = plans.findIndex((plan) => plan.id === selectedPlan);
                  const orderedPlans =
                    selectedIdx === -1
                      ? plans
                      : [...plans.slice(selectedIdx), ...plans.slice(0, selectedIdx)];

                  return orderedPlans.map((plan, idx) => {
                    const isSelected = plan.id === selectedPlan;
                    const visual = plan.popular ? planVisuals.highlight : planVisuals.default;
                    return (
                    <motion.button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      whileHover={{ y: -6 }}
                      className={`group relative flex min-w-[260px] snap-center flex-col rounded-[32px] px-6 py-8 text-left transition-all duration-300 focus:outline-none ${
                        visual.cardBg
                      } ${visual.shadow} ${isSelected ? `${visual.selectedRing} scale-[1.02]` : 'opacity-90 hover:opacity-100'}`}
                    >
                      {plan.popular && (
                        <span
                          className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${visual.badgeBg}`}
                        >
                          Most Popular
                        </span>
                      )}

                      <div className="space-y-3">
                        <h2 className="text-xl font-semibold">{plan.name}</h2>
                        <div className={`text-4xl font-extrabold ${visual.priceText}`}>
                          {formatCurrency(plan.price)}
                        </div>
                        <p className={`text-sm ${visual.mutedText}`}>One-time purchase</p>
                      </div>

                      <div className="mt-6 rounded-3xl bg-white/15 p-5 text-center backdrop-blur-sm dark:bg-white/5">
                        <span
                          className={`text-4xl font-bold ${
                            plan.popular ? 'text-white' : 'text-indigo-500 dark:text-indigo-300'
                          }`}
                        >
                          {plan.optimizations}
                        </span>
                        <p className={`mt-1 text-xs uppercase tracking-wide ${visual.mutedText}`}>Resume Credits</p>
                      </div>

                      <ul className="mt-6 space-y-3 text-sm leading-relaxed">
                        {(plan.features || []).map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${visual.featureIcon}`}>
                              <Check className="h-4 w-4" />
                            </span>
                            <span className={plan.popular ? 'text-white/95' : 'text-gray-700 dark:text-gray-200'}>
                              {renderFeatureText(feature)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <span
                        className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${visual.button}`}
                      >
                        {isSelected ? 'Selected' : 'Choose Plan'}
                      </span>
                    </motion.button>
                  );
                })}
              })()}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={onNavigateBack}
                  className="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-slate-200 dark:bg-dark-200 dark:text-gray-200 dark:hover:bg-dark-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedPlan && setCurrentStep(1)}
                  disabled={!selectedPlan}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </>
          )}

          {currentStep === 1 && selectedPlanData && (
            <div className="space-y-8">
              <button
                onClick={() => setCurrentStep(0)}
                className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-200 dark:bg-dark-200 dark:text-gray-200 dark:hover:bg-dark-300"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to plans
              </button>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-dark-200 dark:bg-dark-100 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add-ons</h2>
                    <button
                      onClick={() => setShowAddOns((prev) => !prev)}
                      className="flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
                    >
                      {showAddOns ? 'Hide add-ons' : 'Show add-ons'}
                      {showAddOns ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                  {showAddOns && (
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {addOns.map((addOn) => (
                        <div
                          key={addOn.id}
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-dark-200 dark:bg-dark-200"
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{addOn.name}</h3>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Rs.{addOn.price}</p>
                          <div className="mt-4 flex items-center gap-3">
                            <button
                              onClick={() => handleAddOnQuantityChange(addOn.id, (selectedAddOns[addOn.id] || 0) - 1)}
                              disabled={!selectedAddOns[addOn.id]}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-dark-100 dark:text-gray-200 dark:hover:bg-dark-300"
                            >
                              -
                            </button>
                            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {selectedAddOns[addOn.id] || 0}
                            </span>
                            <button
                              onClick={() => handleAddOnQuantityChange(addOn.id, (selectedAddOns[addOn.id] || 0) + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-dark-200 dark:bg-dark-100">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Wallet</h2>
                  {loadingWallet ? (
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Fetching wallet balance...</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5 text-emerald-500" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(walletBalance / 100)}
                        </span>
                      </div>
                      {walletBalance > 0 && (
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={useWalletBalance}
                            onChange={(e) => setUseWalletBalance(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Apply wallet balance
                        </label>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Wallet funds will be used before charging any remaining amount.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-dark-200 dark:bg-dark-100">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Coupon</h2>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                    className="input-base flex-1"
                  />
                  {!appliedCoupon ? (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim()}
                      className="btn-primary inline-flex items-center justify-center px-5 py-2"
                    >
                      Apply
                    </button>
                  ) : (
                    <button
                      onClick={handleRemoveCoupon}
                      className="btn-secondary inline-flex items-center justify-center px-5 py-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {couponError && <p className="mt-2 text-sm text-rose-500">{couponError}</p>}
                {appliedCoupon && (
                  <p className="mt-2 text-sm text-emerald-600">
                    Coupon "{appliedCoupon.code}" applied. You saved {formatCurrency(appliedCoupon.discount / 100)}.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-dark-200 dark:bg-dark-100">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Order summary</h2>
                <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Plan price</span>
                    <span>{formatCurrency(planPrice / 100)}</span>
                  </div>
                  {addOnsTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Add-ons</span>
                      <span>{formatCurrency(addOnsTotal / 100)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon discount</span>
                      <span>-{formatCurrency(appliedCoupon.discount / 100)}</span>
                    </div>
                  )}
                  {useWalletBalance && walletDeduction > 0 && (
                    <div className="flex justify-between text-rose-500">
                      <span>Wallet deduction</span>
                      <span>-{formatCurrency(walletDeduction / 100)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-semibold text-gray-900 dark:border-dark-300 dark:text-gray-100">
                    <span>Grand total</span>
                    <span>{formatCurrency(grandTotal / 100)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:w-auto"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5 animate-spin" />
                      Processing
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Proceed to checkout
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
