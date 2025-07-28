"use client";

import React, { FC, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";

const ListYourVenuePage = () => {
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
    <div className="nc-ListYourVenuePage" data-nc-id="ListYourVenuePage">
      <div className="container mx-auto px-4 py-16">
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

        {/* Subscription Fees and Charges Section */}
        <div className="mt-24">
          <div className="max-w-4xl mx-auto">
            {/* Main Heading */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                  </svg>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Subscription Fees and Charges
                </h2>
              </div>
            </div>

            <div className="space-y-12">
              {/* Featured & Priority Listings */}
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Featured & Priority Listings
                  </h3>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Restaurants that choose a <strong>Featured</strong> or <strong>Priority</strong> listing will be charged the monthly fee based on their selected membership level.
                  </p>
                  <p>
                    Billing begins one month after registration.
                  </p>
                </div>
              </div>

              {/* First Year Free - Promotional Offer */}
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    First Year Free - Promotional Offer
                  </h3>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    For Restaurants that elect to take the <strong>First Year Free – Promotional Offer</strong>, Billing will commence at the end of the 13th month after the one-year anniversary of registration.
                  </p>
                  <p>
                    To qualify for the <strong>First Year Free</strong>, restaurants owners must opt in to use our <a href="#" className="text-blue-600 underline hover:text-blue-800">FastTrack Setup Service</a> — where our expert graphic designers will create your online profile for both the <strong>Restaurant Reviews website directory</strong> and <strong>mobile app</strong>. (<em>It's faster, easier — and frankly, done right the first time.</em>)
                  </p>
                  <p>
                    This promotional setup service is <strong>priced the same as one year of membership</strong>, which is why we include your <strong>first year free</strong> in the promotion.
                  </p>
                  <div className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <p>
                      In other words: you're essentially getting your entire setup done at no cost if you compare apples with apples.
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    Your Restaurant. Your Profile. Done Right.
                  </p>
                </div>
              </div>

              {/* Annual Subscriptions */}
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Annual Subscriptions
                  </h3>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Prefer to pay upfront? Receive a <strong>10% discount</strong> when you prepay your membership annually.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListYourVenuePage; 