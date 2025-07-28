import React from "react";
import PricingSection from "@/components/PricingSection";

const ListYourVenuePage = () => {
  return (
    <div className="nc-ListYourVenuePage" data-nc-id="ListYourVenuePage">
      <div className="container mx-auto px-4 py-16">
        <PricingSection />

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