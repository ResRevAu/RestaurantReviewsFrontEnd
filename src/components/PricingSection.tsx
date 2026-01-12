"use client";

import React, { useState, useEffect } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { fetchSubscriptionPlans, SubscriptionPlan } from "@/services/subscriptionApi";

interface DisplayPlan {
  id: string;
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  buttonText: string;
  buttonColor: string;
  cardStyle: string;
  textColor: string;
  priceColor: string;
  specialOffer?: string;
  isPopular?: boolean;
}

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch Restaurant Owner plans
        console.log('🔄 Fetching Restaurant Owner plans...');
        const fetchedPlans = await fetchSubscriptionPlans({ plan_type: "Restaurant Owner" });
        
        console.log('📊 Fetched plans result:', fetchedPlans);
        console.log('📊 Plans count:', fetchedPlans?.length || 0);
        
        if (fetchedPlans && fetchedPlans.length > 0) {
          console.log('✅ Setting plans:', fetchedPlans.map(p => ({
            id: p.id,
            name: p.name,
            pricing_options: p.pricing_options
          })));
          setPlans(fetchedPlans);
        } else {
          console.warn('⚠️ No plans returned from API');
          // Try fetching all plans without filter
          console.log('🔄 Trying to fetch all plans without filter...');
          const allPlans = await fetchSubscriptionPlans();
          if (allPlans && allPlans.length > 0) {
            console.log('✅ Found plans without filter:', allPlans.length);
            // Filter client-side for Restaurant Owner plans
            const ownerPlans = allPlans.filter(p => p.plan_type === "Restaurant Owner");
            if (ownerPlans.length > 0) {
              setPlans(ownerPlans);
            } else {
              setError(`No Restaurant Owner plans found. Found ${allPlans.length} total plans.`);
            }
          } else {
            setError("No plans available at the moment. Please try again later.");
          }
        }
      } catch (err) {
        console.error("❌ Error loading plans:", err);
        setError(`Failed to load plans: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  // Parse description to extract features (split by \r\n or \n)
  const parseDescription = (description: string) => {
    if (!description) return { subtitle: "", features: [], specialOffer: "" };
    
    const lines = description.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract special offer (usually first line if it contains "Free" or similar)
    let specialOffer = "";
    let subtitle = "";
    const features: string[] = [];
    
    // Check for "First Year Free" or similar offers - keep the full line including asterisks
    const offerLine = lines.find(line => 
      line.toLowerCase().includes("first year free")
    );
    if (offerLine) {
      // Keep the offer line as-is, including asterisks
      specialOffer = offerLine;
    }
    
    // Find subtitle - normalize text
    const subtitleLine = lines.find(line => {
      const lower = line.toLowerCase();
      return lower.includes("includes") || 
             lower.includes("unlocks") ||
             lower.includes("simple and effective");
    });
    if (subtitleLine) {
      // Normalize subtitle text
      let normalized = subtitleLine;
      // Fix "Also Includes" to "Includes"
      if (normalized.toLowerCase().includes("also includes")) {
        normalized = normalized.replace(/also includes/gi, "Includes");
      }
      // Fix "unlocks all services features and benefits" to "Unlocks all services and features"
      if (normalized.toLowerCase().includes("unlocks all services")) {
        normalized = normalized.replace(/unlocks all services features and benefits/gi, "Unlocks all services and features");
        normalized = normalized.replace(/unlocks all services features/gi, "Unlocks all services and features");
      }
      subtitle = normalized;
    }
    
    // Everything else are features (skip offer line, subtitle line, and conditions)
    lines.forEach(line => {
      if (line !== offerLine && line !== subtitleLine && 
          !line.toLowerCase().includes("conditions apply") &&
          line.length > 5) { // Filter out very short lines
        features.push(line);
      }
    });
    
    return { subtitle, features, specialOffer };
  };

  // Sort plans: Free Listing first, Featured in middle, Priority last
  const sortPlans = (plans: SubscriptionPlan[]): SubscriptionPlan[] => {
    return [...plans].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Define order: Free = 0, Featured = 1, Priority = 2
      const getOrder = (name: string) => {
        if (name.includes("free")) return 0;
        if (name.includes("featured")) return 1;
        if (name.includes("priority")) return 2;
        return 3; // Other plans go last
      };
      
      return getOrder(aName) - getOrder(bName);
    });
  };

  // Transform API plans to display format
  const transformPlansToDisplay = (apiPlans: SubscriptionPlan[]): DisplayPlan[] => {
    console.log('🔄 Transforming plans for display. isAnnual:', isAnnual);
    
    // Sort plans: Free first, Featured middle, Priority last
    const sortedPlans = sortPlans(apiPlans);
    
    console.log('📋 Sorted plans:', sortedPlans.map(p => p.name));
    
    return sortedPlans.map((plan, index) => {
      // Get pricing option based on billing cycle toggle
      const billingCycle = isAnnual ? "yearly" : "monthly";
      const pricingOption = plan.pricing_options?.find(
        opt => opt.billing_cycle.toLowerCase() === billingCycle
      ) || plan.pricing_options?.[0]; // Fallback to first option
      
      const price = pricingOption ? parseFloat(pricingOption.price).toFixed(2) : "0.00";
      
      // Parse description to extract subtitle, features, and special offer
      const { subtitle, features, specialOffer } = parseDescription(plan.description);
      
      // Determine styling based on plan position/name
      const nameLower = plan.name.toLowerCase();
      const isPopular = nameLower.includes("featured") || index === 1;
      const isDarkCard = isPopular;
      
      return {
        id: plan.id.toString(),
        title: plan.name,
        price: `$${price}`,
        subtitle: subtitle || "",
        features: features.length > 0 ? features : ["Contact us for details"],
        buttonText: "Choose Starter",
        buttonColor: isPopular ? "bg-[#4f46e5] hover:bg-[#3730a3]" : "bg-gray-700 hover:bg-gray-800",
        cardStyle: isDarkCard ? "bg-gray-900" : "bg-white border border-gray-200",
        textColor: isDarkCard ? "text-white" : "text-gray-900",
        priceColor: isDarkCard ? "text-white" : "text-gray-900",
        specialOffer: specialOffer || undefined,
        isPopular: isPopular
      };
    });
  };

  const displayPlans = transformPlansToDisplay(plans);
  
  // Debug logging
  useEffect(() => {
    if (plans.length > 0) {
      console.log('📊 Component state:', {
        plansCount: plans.length,
        displayPlansCount: displayPlans.length,
        isAnnual,
        loading,
        error
      });
    }
  }, [plans, displayPlans, isAnnual, loading, error]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Ready to List Your Restaurant?
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          It's simple — just choose your plan and follow the quick setup wizard to get started.
        </p>

        {/* Pricing Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              !isAnnual
                ? "bg-gray-200 text-gray-900"
                : "bg-white text-gray-600 border border-gray-300"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              isAnnual
                ? "bg-gray-200 text-gray-900"
                : "bg-white text-gray-600 border border-gray-300"
            }`}
          >
            Annually
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-800 font-medium mb-2">{error}</p>
            {plans.length > 0 && (
              <div className="mt-4 text-left text-sm text-red-700">
                <p className="font-semibold">Debug Info:</p>
                <p>Total plans fetched: {plans.length}</p>
                <p>Current filter: {isAnnual ? "annual/yearly" : "monthly/month"}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer">View all plans</summary>
                  <pre className="mt-2 text-xs overflow-auto bg-red-100 p-2 rounded">
                    {JSON.stringify(plans.map(p => ({
                      id: p.id,
                      name: p.name,
                      pricing_options: p.pricing_options
                    })), null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      {!loading && !error && displayPlans.length > 0 && (
        <div className={`grid gap-8 ${displayPlans.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : displayPlans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'}`}>
          {displayPlans.map((plan) => (
          <div
            key={plan.id}
            className={`${plan.cardStyle} rounded-2xl p-8 shadow-lg relative transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${
              plan.isPopular ? "ring-2 ring-[#4f46e5] ring-offset-4" : ""
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#4f46e5] text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            {/* Plan Title */}
            <h3 className={`text-2xl font-bold ${plan.textColor} mb-4`}>
              {plan.title}
            </h3>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline">
                <span className={`text-4xl font-bold ${plan.priceColor}`}>
                  {plan.price}
                </span>
                <span className={`text-lg ml-1 ${plan.textColor} opacity-70`}>
                  /{isAnnual ? "year" : "month"}
                </span>
              </div>
              {plan.specialOffer && (
                <div className="mt-2">
                  <span className={`text-sm font-medium ${plan.textColor}`}>
                    {plan.specialOffer}
                  </span>
                </div>
              )}
            </div>

            {/* Subtitle */}
            <p className={`text-sm ${plan.textColor} opacity-70 mb-6`}>
              {plan.subtitle}
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className={`text-sm ${plan.textColor} opacity-90`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Button */}
            <button
              className={`w-full ${plan.buttonColor} text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
        </div>
      )}

      {/* No Plans Available - This should rarely show now since we show all plans as fallback */}
      {!loading && !error && displayPlans.length === 0 && plans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No plans available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default PricingSection; 