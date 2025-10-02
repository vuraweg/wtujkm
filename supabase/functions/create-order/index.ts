import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Update the interface to include selectedAddOns
interface OrderRequest {
  planId: string;
  couponCode?: string;
  walletDeduction?: number; // In paise
  addOnsTotal?: number; // In paise
  amount: number; // In paise (frontend calculated grandTotal)
  selectedAddOns?: { [key: string]: number };
}

interface PlanConfig {
  id: string;
  name: string;
  price: number; // In Rupees
  mrp: number; // New: Manufacturer's Recommended Price
  discountPercentage: number; // Calculated discount percentage
  duration: string;
  optimizations: number;
  scoreChecks: number;
  linkedinMessages: number; // Corrected to number
  guidedBuilds: number;
  durationInHours: number;
  tag: string;
  tagColor: string;
  gradient: string;
  icon: string;
  features: string[];
  popular?: boolean;
}

// UPDATED PLANS ARRAY - MUST MATCH src/services/paymentService.ts
const plans: PlanConfig[] = [
  {
    id: 'leader_plan',
    name: 'Leader Plan',
    price: 6400,
    mrp: 12800,
    discountPercentage: 50,
    duration: 'One-time Purchase',
    optimizations: 100,
    scoreChecks: 100,
    linkedinMessages: 0,
    guidedBuilds: 0,
    tag: 'Top Tier',
    tagColor: 'text-purple-800 bg-purple-100',
    gradient: 'from-purple-500 to-indigo-500',
    icon: 'crown',
    features: [
      '✅ 100 Resume Optimizations',
      '✅ 100 Score Checks',
      '❌ LinkedIn Messages',
      '❌ Guided Builds',
      '✅ Priority Support',
    ],
    popular: true,
    durationInHours: 8760, // 1 year
  },
  {
    id: 'achiever_plan',
    name: 'Achiever Plan',
    price: 3200,
    mrp: 6400,
    discountPercentage: 50,
    duration: 'One-time Purchase',
    optimizations: 50,
    scoreChecks: 50,
    linkedinMessages: 0,
    guidedBuilds: 0,
    tag: 'Best Value',
    tagColor: 'text-blue-800 bg-blue-100',
    gradient: 'from-blue-500 to-cyan-500',
    icon: 'zap',
    features: [
      '✅ 50 Resume Optimizations',
      '✅ 50 Score Checks',
      '❌ LinkedIn Messages',
      '❌ Guided Builds',
      '✅ Standard Support',
    ],
    popular: false,
    durationInHours: 8760,
  },
  {
    id: 'accelerator_plan',
    name: 'Accelerator Plan',
    price: 1600,
    mrp: 3200,
    discountPercentage: 50,
    duration: 'One-time Purchase',
    optimizations: 25,
    scoreChecks: 25,
    linkedinMessages: 0,
    guidedBuilds: 0,
    tag: 'Great Start',
    tagColor: 'text-green-800 bg-green-100',
    gradient: 'from-green-500 to-emerald-500',
    icon: 'rocket',
    features: [
      '✅ 25 Resume Optimizations',
      '✅ 25 Score Checks',
      '❌ LinkedIn Messages',
      '❌ Guided Builds',
      '✅ Email Support',
    ],
    popular: false,
    durationInHours: 8760,
  },
  {
    id: 'starter_plan',
    name: 'Starter Plan',
    price: 640,
    mrp: 1280,
    discountPercentage: 50,
    duration: 'One-time Purchase',
    optimizations: 10,
    scoreChecks: 10,
    linkedinMessages: 0,
    guidedBuilds: 0,
    tag: 'Quick Boost',
    tagColor: 'text-yellow-800 bg-yellow-100',
    gradient: 'from-yellow-500 to-orange-500',
    icon: 'target',
    features: [
      '✅ 10 Resume Optimizations',
      '✅ 10 Score Checks',
      '❌ LinkedIn Messages',
      '❌ Guided Builds',
      '✅ Basic Support',
    ],
    popular: false,
    durationInHours: 8760,
  },
  {
    id: 'kickstart_plan',
    name: 'Kickstart Plan',
    price: 320,
    mrp: 640,
    discountPercentage: 50,
    duration: 'One-time Purchase',
    optimizations: 5,
    scoreChecks: 5,
    linkedinMessages: 0,
    guidedBuilds: 0,
    tag: 'Essential',
    tagColor: 'text-red-800 bg-red-100',
    gradient: 'from-red-500 to-pink-500',
    icon: 'wrench',
    features: [
      '✅ 5 Resume Optimizations',
      '✅ 5 Score Checks',
      '❌ LinkedIn Messages',
      '❌ Guided Builds',
      '❌ Priority Support',
    ],
    popular: false,
    durationInHours: 8760,
  },
];

// Defined add-ons with their types and quantities
// This list MUST match the addOns array in src/services/paymentService.ts
const addOns = [
  // NEW ADD-ON: Single JD-Based Optimization Purchase
  {
    id: 'jd_optimization_single_purchase',
    name: 'JD-Based Optimization (1 Use)',
    price: 49, // Example price in Rupees
    type: 'optimization',
    quantity: 1,
  },
  // NEW ADD-ON: Single Resume Score Check Purchase
  {
    id: 'resume_score_check_single_purchase',
    name: 'Resume Score Check (1 Use)',
    price: 19,
    type: 'score_check',
    quantity: 1,
  },
];

serve(async (req) => {
  // Log function start
  console.log(`[${new Date().toISOString()}] - Function execution started.`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Retrieve addOnsTotal from the request body
    const body: OrderRequest = await req.json();
    // All amounts from frontend (amount, walletDeduction, addOnsTotal) are now in paise
    const { planId, couponCode, walletDeduction, addOnsTotal, amount: frontendCalculatedAmount, selectedAddOns } = body;
    console.log(`[${new Date().toISOString()}] - Request body parsed. planId: ${planId}, couponCode: ${couponCode}, walletDeduction: ${walletDeduction}, addOnsTotal: ${addOnsTotal}, frontendCalculatedAmount: ${frontendCalculatedAmount}, selectedAddOns: ${JSON.stringify(selectedAddOns)}`);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    // Log after user authentication
    console.log(`[${new Date().toISOString()}] - User authentication complete. User ID: ${user?.id || 'N/A'}`);

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get plan details
    let plan: PlanConfig;
    if (planId === 'addon_only_purchase' || planId === null) {
      plan = {
        id: 'addon_only_purchase',
        name: 'Add-on Only Purchase',
        price: 0, // In Rupees
        mrp: 0, // MRP
        discountPercentage: 0, // Discount percentage
        duration: 'One-time Purchase',
        optimizations: 0,
        scoreChecks: 0,
        linkedinMessages: 0,
        guidedBuilds: 0,
        durationInHours: 0, // No specific duration for add-on only
        tag: '',
        tagColor: '',
        gradient: '',
        icon: '',
        features: [],
      };
    } else {
      const foundPlan = plans.find((p) => p.id === planId);
      if (!foundPlan) {
        throw new Error('Invalid plan selected');
      }
      plan = foundPlan;
    }

    // Calculate final amount based on plan price (all calculations in paise)
    // Ensure this line is at the top level of the try block
    let originalPrice = (plan?.price || 0) * 100; // Convert to paise, or 0 if addon_only

    let discountAmount = 0;
    let finalAmount = originalPrice;
    let appliedCoupon = null;

    if (couponCode) {
      const normalizedCoupon = couponCode.toLowerCase().trim();

      // Per-user coupon usage check (now applies to all non-empty coupon codes)
      const { count: userCouponUsageCount, error: userCouponUsageError } = await supabase
        .from('payment_transactions')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('coupon_code', normalizedCoupon)
        .in('status', ['success', 'pending']);

      if (userCouponUsageError) {
        console.error(`[${new Date().toISOString()}] - Error checking user coupon usage:`, userCouponUsageError);
        throw new Error('Failed to verify coupon usage. Please try again.');
      }

      if (userCouponUsageCount && userCouponUsageCount > 0) {
        console.log(`[${new Date().toISOString()}] - Coupon "${normalizedCoupon}" already used by user ${user.id}.`);
        return new Response(
          JSON.stringify({ error: `Coupon "${normalizedCoupon}" has already been used by this account.` }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400, // Bad Request
          },
        );
      }
      // END Per-user coupon usage check

      // Existing coupon logic
      // NEW: full_support coupon - free career_pro_max plan
      if (normalizedCoupon === 'fullsupport' && planId === 'career_pro_max') {
        finalAmount = 0;
        discountAmount = plan.price * 100; // In paise
        appliedCoupon = 'fullsupport';
      }
      // first100 coupon - free lite_check plan only
      else if (normalizedCoupon === 'first100' && planId === 'lite_check') {
        finalAmount = 0;
        discountAmount = plan.price * 100; // In paise
        appliedCoupon = 'first100';
      }
      // first500 coupon - 98% off lite_check plan only (NEW LOGIC)
      else if (normalizedCoupon === 'first500' && planId === 'lite_check') {
        // Check usage limit for first500 coupon (global limit)
        const { count, error: countError } = await supabase
          .from('payment_transactions')
          .select('id', { count: 'exact' })
          .eq('coupon_code', 'first500')
          .in('status', ['success', 'pending']); // Count successful and pending uses

        if (countError) {
          console.error(`[${new Date().toISOString()}] - Error counting first500 coupon usage:`, countError);
          throw new Error('Failed to verify coupon usage. Please try again.');
        }

        if (count && count >= 500) {
          throw new Error('Coupon "first500" has reached its usage limit.');
        }

        discountAmount = Math.floor(plan.price * 100 * 0.98); // Calculate in paise
        finalAmount = (plan.price * 100) - discountAmount; // Calculate in paise
        appliedCoupon = 'first500';
      }
      // worthyone coupon - 50% off career_pro_max plan only
      else if (normalizedCoupon === 'worthyone' && planId === 'career_pro_max') {
        const discountAmount = Math.floor(plan.price * 100 * 0.5); // Calculate in paise
        finalAmount = (plan.price * 100) - discountAmount; // Calculate in paise
        appliedCoupon = 'worthyone';
      }
      // NEW COUPON LOGIC: VNKR50% for career_pro_max
      else if (normalizedCoupon === 'vnkr50%' && planId === 'career_pro_max') {
        discountAmount = Math.floor(originalPrice * 0.5); // 50% off
        finalAmount = originalPrice - discountAmount;
        appliedCoupon = 'vnkr50%';
      }
      // NEW COUPON LOGIC: VNK50 for career_pro_max
      else if (normalizedCoupon === 'vnk50' && planId === 'career_pro_max') {
        discountAmount = Math.floor(originalPrice * 0.5); // 50% off
        finalAmount = originalPrice - discountAmount;
        appliedCoupon = 'vnk50';
      }
      else {
        // If coupon is not recognized or not applicable to the plan, do not apply discount
        // and return an error message.
        return new Response(
          JSON.stringify({ error: 'Invalid coupon code or not applicable to selected plan.' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          },
        );
      }
    }

    // Apply wallet deduction (walletDeduction is already in paise from frontend)
    if (walletDeduction && walletDeduction > 0) {
      finalAmount = Math.max(0, finalAmount - walletDeduction);
    }

    // Correctly add add-ons total to the final amount (addOnsTotal is already in paise from frontend)
    if (addOnsTotal && addOnsTotal > 0) {
      finalAmount += addOnsTotal;
    }

    // IMPORTANT: Validate that the calculated finalAmount matches the frontend's calculation
    // This prevents tampering with the price on the client-side.
    // frontendCalculatedAmount is already in paise
    if (finalAmount !== frontendCalculatedAmount) {
      console.error(`[${new Date().toISOString()}] - Price mismatch detected! Backend calculated: ${finalAmount}, Frontend sent: ${frontendCalculatedAmount}`);
      throw new Error('Price mismatch detected. Please try again.');
    }

    // --- NEW: Create a pending payment_transactions record ---
    console.log(`[${new Date().toISOString()}] - Creating pending payment_transactions record.`);
    // All amounts for insert are now in paise (integers)
    console.log(`[${new Date().toISOString()}] - Values for insert: user_id=${user.id}, plan_id=${planId}, status='pending', amount=${plan.price * 100}, currency='INR', coupon_code=${appliedCoupon}, discount_amount=${discountAmount}, final_amount=${finalAmount}`);

    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        plan_id: planId === 'addon_only_purchase' ? null : planId, // plan_id is text, not uuid
        status: 'pending', // Initial status
        amount: plan.price * 100, // Original plan price in paise
        currency: 'INR', // Explicitly set currency as it's not nullable and has a default
        coupon_code: appliedCoupon, // Save applied coupon code
        discount_amount: discountAmount, // In paise
        final_amount: finalAmount, // Final amount after discounts/wallet/addons (in paise)
        purchase_type: planId === 'addon_only_purchase' ? 'addon_only' : (Object.keys(selectedAddOns || {}).length > 0 ? 'plan_with_addons' : 'plan'),
        // payment_id and order_id will be updated by verify-payment function
      })
      .select('id') // Select the ID of the newly created row
      .single();

    if (transactionError) {
      console.error(`[${new Date().toISOString()}] - Error inserting pending transaction:`, transactionError);
      throw new Error('Failed to initiate payment transaction.');
    }
    const transactionId = transaction.id;
    console.log(`[${new Date().toISOString()}] - Pending transaction created with ID: ${transactionId}, coupon_code: ${appliedCoupon}`);
    // --- END NEW ---

    // Create Razorpay order
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    const orderData = {
      amount: finalAmount, // Amount is already in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planId: planId,
        planName: plan.name,
        originalAmount: plan.price * 100, // Original plan price in paise
        couponCode: appliedCoupon,
        discountAmount: discountAmount, // In paise
        walletDeduction: walletDeduction || 0, // In paise - Store the actual walletDeduction
        addOnsTotal: addOnsTotal || 0, // In paise
        transactionId: transactionId, // Pass the transactionId to Razorpay notes
        selectedAddOns: JSON.stringify(selectedAddOns || {}),
      },
    };

    console.log(`[${new Date().toISOString()}] - Before making Razorpay API call with data: ${JSON.stringify(orderData)}`);

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    // Log after receiving response from Razorpay
    console.log(`[${new Date().toISOString()}] - Received response from Razorpay API. Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay API error:', errorText);
      // If Razorpay order creation fails, mark the pending transaction as failed
      await supabase.from('payment_transactions').update({ status: 'failed' }).eq('id', transactionId);
      throw new Error('Failed to create payment order with Razorpay');
    }

    const order = await response.json();

    // Log before returning the final response
    console.log(`[${new Date().toISOString()}] - Returning final response. Order ID: ${order.id}, Transaction ID: ${transactionId}`);

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: finalAmount, // Amount is already in paise
        keyId: razorpayKeyId,
        currency: 'INR',
        transactionId: transactionId, // Return the transactionId to the frontend
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] - Error creating order:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});

