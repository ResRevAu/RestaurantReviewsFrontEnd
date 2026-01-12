"use client";

import React, { useState, useEffect } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { fetchSubscriptionPlans, SubscriptionPlan } from "@/services/subscriptionApi";

interface Step3PlanSelectionProps {
  formData: {
    selected_plan_id: number | null;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Step3PlanSelection: React.FC<Step3PlanSelectionProps> = ({
  formData,
  setFormData,
}) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const fetchedPlans = await fetchSubscriptionPlans({ plan_type: "Restaurant Owner" });
        
        if (fetchedPlans && fetchedPlans.length > 0) {
          setPlans(fetchedPlans);
        } else {
          const allPlans = await fetchSubscriptionPlans();
          if (allPlans && allPlans.length > 0) {
            const ownerPlans = allPlans.filter(p => p.plan_type === "Restaurant Owner");
            if (ownerPlans.length > 0) {
              setPlans(ownerPlans);
            } else {
              setError("No Restaurant Owner plans found.");
            }
          } else {
            setError("No plans available at the moment. Please try again later.");
          }
        }
      } catch (err) {
        console.error("Error loading plans:", err);
        setError(`Failed to load plans: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const parseDescription = (description: string) => {
    if (!description) return { subtitle: "", features: [], specialOffer: "" };
    
    const lines = description.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    
    let specialOffer = "";
    let subtitle = "";
    const features: string[] = [];
    
    const offerLine = lines.find(line => 
      line.toLowerCase().includes("first year free")
    );
    if (offerLine) {
      specialOffer = offerLine;
    }
    
    const subtitleLine = lines.find(line => {
      const lower = line.toLowerCase();
      return lower.includes("includes") || 
             lower.includes("unlocks") ||
             lower.includes("simple and effective");
    });
    if (subtitleLine) {
      let normalized = subtitleLine;
      if (normalized.toLowerCase().includes("also includes")) {
        normalized = normalized.replace(/also includes/gi, "Includes");
      }
      if (normalized.toLowerCase().includes("unlocks all services")) {
        normalized = normalized.replace(/unlocks all services features and benefits/gi, "Unlocks all services and features");
        normalized = normalized.replace(/unlocks all services features/gi, "Unlocks all services and features");
      }
      subtitle = normalized;
    }
    
    lines.forEach(line => {
      if (line !== offerLine && line !== subtitleLine && 
          !line.toLowerCase().includes("conditions apply") &&
          line.length > 5) {
        features.push(line);
      }
    });
    
    return { subtitle, features, specialOffer };
  };

  const sortPlans = (plans: SubscriptionPlan[]): SubscriptionPlan[] => {
    return [...plans].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      const getOrder = (name: string) => {
        if (name.includes("free")) return 0;
        if (name.includes("featured")) return 1;
        if (name.includes("priority")) return 2;
        return 3;
      };
      
      return getOrder(aName) - getOrder(bName);
    });
  };

  const handlePlanSelect = (planId: number) => {
    setFormData((prev: any) => ({
      ...prev,
      selected_plan_id: planId,
    }));
  };

  const displayPlans = () => {
    const sortedPlans = sortPlans(plans);
    
    return sortedPlans.map((plan) => {
      const billingCycle = isAnnual ? "yearly" : "monthly";
      const pricingOption = plan.pricing_options?.find(
        opt => opt.billing_cycle.toLowerCase() === billingCycle
      ) || plan.pricing_options?.[0];
      
      const price = pricingOption ? parseFloat(pricingOption.price).toFixed(2) : "0.00";
      const { subtitle, features, specialOffer } = parseDescription(plan.description);
      
      const nameLower = plan.name.toLowerCase();
      const isPopular = nameLower.includes("featured");
      const isSelected = formData.selected_plan_id === plan.id;
      
      return {
        id: plan.id,
        title: plan.name,
        price: `$${price}`,
        subtitle: subtitle || "",
        features: features.length > 0 ? features : ["Contact us for details"],
        specialOffer: specialOffer || undefined,
        isPopular,
        isSelected,
      };
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Loading plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const plansToDisplay = displayPlans();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Choose Plan
        </h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700 mt-2"></div>
      </div>

      {/* Pricing Toggle */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => setIsAnnual(false)}
          className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
            !isAnnual
              ? "bg-gray-200 text-gray-900 shadow-sm"
              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setIsAnnual(true)}
          className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
            isAnnual
              ? "bg-gray-200 text-gray-900 shadow-sm"
              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Annually
        </button>
      </div>

      {/* Pricing Cards */}
      <div className={`grid gap-6 md:gap-8 ${plansToDisplay.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : plansToDisplay.length === 2 ? 'md:grid-cols-2 max-w-5xl mx-auto' : 'md:grid-cols-3 max-w-6xl mx-auto'}`}>
        {plansToDisplay.map((plan) => {
          const isDarkCard = plan.isPopular;
          const textColor = isDarkCard ? "text-white" : "text-gray-900";
          const priceColor = isDarkCard ? "text-white" : "text-gray-900";
          const featureTextColor = isDarkCard ? "text-white opacity-90" : "text-gray-700";
          const subtitleColor = isDarkCard ? "text-white opacity-70" : "text-gray-600";
          
          return (
            <div
              key={plan.id}
              onClick={() => handlePlanSelect(plan.id)}
              className={`rounded-2xl p-8 md:p-10 shadow-lg relative transition-all duration-300 ease-in-out cursor-pointer min-h-[500px] flex flex-col ${
                isDarkCard
                  ? plan.isSelected
                    ? "bg-gray-900 ring-4 ring-green-400 ring-offset-2"
                    : "bg-gray-900 ring-2 ring-[#4f46e5] ring-offset-4"
                  : plan.isSelected
                  ? "bg-green-50 border-green-500 ring-4 ring-green-500 ring-offset-2"
                  : "bg-white border border-gray-200 hover:border-green-300 hover:shadow-xl"
              }`}
            >
              {/* Most Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-[#4f46e5] text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Selected Indicator */}
              {plan.isSelected && (
                <div className={`absolute top-4 right-4 z-10 ${isDarkCard ? "bg-white" : "bg-green-500"} rounded-full flex items-center justify-center w-8 h-8 shadow-lg`}>
                  <CheckIcon className={`w-5 h-5 ${isDarkCard ? "text-green-500" : "text-white"}`} />
                </div>
              )}

              {/* Plan Title */}
              <h3 className={`text-2xl font-bold mb-5 ${textColor} break-words`}>
                {plan.title}
              </h3>

              {/* Price */}
              <div className="mb-5">
                <div className="flex items-baseline flex-wrap">
                  <span className={`text-4xl font-bold ${priceColor}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg ml-1.5 ${isDarkCard ? "text-white opacity-70" : "text-gray-600"}`}>
                    /{isAnnual ? "year" : isDarkCard ? "mo" : "month"}
                  </span>
                </div>
                {plan.specialOffer && (
                  <div className="mt-3">
                    <span className={`text-sm font-semibold ${textColor} break-words`}>
                      {plan.specialOffer}
                    </span>
                  </div>
                )}
              </div>

              {/* Subtitle */}
              {plan.subtitle && (
                <p className={`text-sm mb-6 leading-relaxed ${subtitleColor} break-words`}>
                  {plan.subtitle}
                </p>
              )}

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${isDarkCard ? "text-green-400" : "text-green-500"}`} />
                    <span className={`text-sm leading-relaxed ${featureTextColor} break-words`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Step3PlanSelection;

