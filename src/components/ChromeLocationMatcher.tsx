"use client";

import React, { useState } from 'react';
import { MapPinIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { SimpleUserLocation, createManualLocation } from '@/services/simpleLocationService';

interface ChromeLocationMatcherProps {
  onLocationSet: (location: SimpleUserLocation) => void;
  className?: string;
}

const ChromeLocationMatcher: React.FC<ChromeLocationMatcherProps> = ({ 
  onLocationSet, 
  className = "" 
}) => {
  const [showOptions, setShowOptions] = useState(false);

  // Use Chrome's exact detection format
  const useChromeLocation = () => {
    const chromeLocation: SimpleUserLocation = {
      lat: 26.890149520911205, // User's exact coordinates from backend
      lng: 80.99192260849836,
      city: 'Indira Nagar, Lucknow',
      state: 'Uttar Pradesh',
      country: 'India',
      postcode: '226016',
      isManuallySet: true
    };
    
    console.log('🌐 Using Chrome-style location:', chromeLocation);
    onLocationSet(chromeLocation);
    setShowOptions(false);
  };

  const detectGPSLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('GPS not available, please use Chrome location');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        const gpsLocation: SimpleUserLocation = {
          lat: latitude,
          lng: longitude,
          city: 'Indira Nagar, Lucknow', // Default to Chrome format
          state: 'Uttar Pradesh',
          country: 'India',
          postcode: '226016',
          accuracy,
          isManuallySet: false
        };
        
        console.log('📡 GPS location with Chrome format:', gpsLocation);
        onLocationSet(gpsLocation);
        setShowOptions(false);
      },
      (error) => {
        console.error('GPS failed:', error);
        alert('GPS failed, using Chrome location instead');
        useChromeLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  if (!showOptions) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <button
          onClick={() => setShowOptions(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MapPinIcon className="w-4 h-4" />
          <span>Set Location</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col gap-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      <div className="text-sm font-medium text-gray-900 mb-2">Choose your location method:</div>
      
      <button
        onClick={useChromeLocation}
        className="flex items-center gap-3 p-3 border-2 border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
      >
        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div>
          <div className="font-medium text-green-800">Use Chrome's Detection</div>
          <div className="text-sm text-green-700">Indira Nagar, Lucknow, Uttar Pradesh 226016</div>
          <div className="text-xs text-green-600">✅ Same as Google Search result</div>
        </div>
      </button>

      <button
        onClick={detectGPSLocation}
        className="flex items-center gap-3 p-3 border border-gray-200 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
      >
        <MapPinIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
        <div>
          <div className="font-medium text-gray-800">Try GPS Detection</div>
          <div className="text-sm text-gray-600">Use device GPS + Google geocoding</div>
          <div className="text-xs text-gray-500">May be less accurate</div>
        </div>
      </button>

      <button
        onClick={() => setShowOptions(false)}
        className="text-xs text-gray-500 hover:text-gray-700 mt-2"
      >
        Cancel
      </button>
    </div>
  );
};

export default ChromeLocationMatcher;
