import React, { FC } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export interface PostReviewPageProps {
  className?: string;
}

const PostReviewPage: FC<PostReviewPageProps> = ({ className = "" }) => {
  return (
    <div className={`nc-PostReviewPage ${className}`} data-nc-id="PostReviewPage">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Post a Photo or Review
            <br />
            of Your Favourite Restaurant
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
            Share your experience — show off the food, rate the vibe, and help others discover their next great meal.
          </p>

          {/* Search Section */}
          <div className="bg-gray-100 rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-xl p-4 shadow-sm">
              {/* Search Icon */}
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 bg-[#4f46e5] rounded-full flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search restaurants by name"
                className="flex-1 text-gray-900 placeholder-gray-500 focus:outline-none text-lg"
              />

              {/* Search Button */}
              <button className="ml-4 bg-[#4f46e5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#3730a3] transition-colors duration-200">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostReviewPage; 