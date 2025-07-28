import React from "react";
import SectionGridAuthorBox from "@/components/SectionGridAuthorBox";
import BackgroundSection from "@/components/BackgroundSection";

const ServicesPage = () => {
  return (
    <div className="nc-ServicesPage" data-nc-id="ServicesPage">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              The World's Largest Restaurant & Food Directory
            </h1>
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 mb-8">
              Connecting Diners & Restaurants Everywhere — Discover. Review. Remember.
            </h2>
          </div>

          {/* Content Section */}
          <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
            <p>
              At <strong>Restaurant Reviews</strong>, we've built a platform that serves both sides of the table — diners and restaurant owners alike.
            </p>
            
            <p>
              Our directory and mobile app are packed with tools and features designed to make discovering, choosing, and enjoying great food easier than ever, while also helping restaurants grow their presence and reach more customers.
            </p>
            
            <p>
              From finding the perfect place to eat, finding that favourite meal, to posting reviews and sharing photos, to helping restaurants manage their profiles, attract loyal customers, and showcase their menus — we make the connection seamless.
            </p>
            
            <p className="text-center font-semibold text-gray-900">
              Below, you'll find just some of the <strong>key services and benefits we provide for diners and for restaurant owners.</strong>
            </p>
          </div>

          {/* For Restaurant Owners Section */}
          <div className="mt-24">
            <div className="relative py-16">
              <BackgroundSection className="bg-neutral-100 dark:bg-black dark:bg-opacity-20" />
              <div className="relative z-10">
                <div className="text-center mb-16">
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    For Restaurant Owners
                  </h2>
                  <p className="text-xl text-gray-700">
                    Everything You Need to Put Your Restaurant on the Map
                  </p>
                </div>
                <SectionGridAuthorBox boxCard="box2" showHeading={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage; 