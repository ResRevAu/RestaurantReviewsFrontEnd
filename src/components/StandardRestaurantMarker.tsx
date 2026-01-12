"use client";

import React, { useState } from 'react';

interface StandardRestaurantMarkerProps {
  restaurant: any;
  isSelected?: boolean;
}

const StandardRestaurantMarker: React.FC<StandardRestaurantMarkerProps> = ({
  restaurant,
  isSelected = false
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div 
      className="relative cursor-pointer"
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      {/* Standard Restaurant Marker */}
      <div className={`
        relative w-8 h-8 transform transition-all duration-200
        ${isSelected ? 'scale-125 z-20' : 'z-10 hover:scale-110'}
      `}>
        {/* Marker Pin */}
        <div className={`
          absolute bottom-0 left-1/2 transform -translate-x-1/2
          w-6 h-6 rounded-full border-2 border-white shadow-lg
          ${isSelected ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600'}
        `}>
          {/* Restaurant Icon */}
          <svg 
            className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M12 2a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2h4zm-1 1a1 1 0 00-1 1v3h2V4a1 1 0 00-1-1h-1zm1 7V8h-2v2h2z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Marker Tail */}
        <div className={`
          absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2
          w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent
          ${isSelected ? 'border-t-red-600' : 'border-t-red-500'}
        `} />
      </div>

      {/* Info Popup */}
      {showInfo && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-3 z-30">
          <div className="text-sm font-bold text-gray-900 mb-1">
            {restaurant.title}
          </div>
          <div className="text-xs text-gray-600 mb-2">
            {restaurant.address}
          </div>
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">⭐</span>
              <span className="text-gray-700">{restaurant.reviewCount || 0} reviews</span>
            </div>
            <span className="font-semibold text-green-600">
              {restaurant.price || '$$$'}
            </span>
          </div>
          {restaurant.distanceFormatted && (
            <div className="text-xs text-blue-600 mt-2 font-medium">
              📍 {restaurant.distanceFormatted} from you
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              View Details →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardRestaurantMarker;
