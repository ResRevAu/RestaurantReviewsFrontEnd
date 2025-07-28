"use client";

import React, { useState } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingPlans = [
    {
      id: "free",
      title: "Free Listing",
      price: "$0.00",
      subtitle: "Simple and effective",
      features: [
        "List Restaurant Name",
        "List address (appear on map locations)",
        "Public viewing & content enabled",
        "Review notifications",
        "Free QR code to promote your restaurant",
        "Cancel anytime",
        "Upgrade at anytime"
      ],
      buttonText: "Choose Starter",
      buttonColor: "bg-gray-700 hover:bg-gray-800",
      cardStyle: "bg-white border border-gray-200",
      textColor: "text-gray-900",
      priceColor: "text-gray-900"
    },
    {
      id: "featured",
      title: "Featured Listing",
      price: isAnnual ? "$290.00" : "$29.00",
      subtitle: "Also Includes all the Free listing benefits plus",
      features: [
        "Promote your menu with photos and/or A.i imagery",
        "Add your venues photos & videos",
        "Showcase your amenities",
        "Display operational hours",
        "Online booking links",
        "Full control over your public profile"
      ],
      buttonText: "Choose Starter",
      buttonColor: "bg-[#4f46e5] hover:bg-[#3730a3]",
      cardStyle: "bg-gray-900",
      textColor: "text-white",
      priceColor: "text-white",
      specialOffer: "First Year Free*",
      isPopular: true
    },
    {
      id: "priority",
      title: "Priority Listing",
      price: isAnnual ? "$390.00" : "$39.00",
      subtitle: "unlocks all services features and benefits plus",
      features: [
        "Control, respond and rank reviews",
        "Highlighted, prioritised locality listing",
        "Promote specials, events, and offers to your clients",
        "Receive Analytics of your restaurant and menu items",
        "Access competitor analysis statistics",
        "Reward customer reviews"
      ],
      buttonText: "Choose Starter",
      buttonColor: "bg-gray-700 hover:bg-gray-800",
      cardStyle: "bg-white border border-gray-200",
      textColor: "text-gray-900",
      priceColor: "text-gray-900",
      specialOffer: "First Year Free"
    }
  ];

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

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {pricingPlans.map((plan) => (
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
                  <br />
                  <span className={`text-xs ${plan.textColor} opacity-70`}>
                    *Conditions apply
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
    </div>
  );
};

export default PricingSection; 