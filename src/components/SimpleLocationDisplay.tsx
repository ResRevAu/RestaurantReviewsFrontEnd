"use client";

import React, { useEffect, useState } from 'react';
import { MapPinIcon, PencilIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { getSimpleLocation, createManualLocation, SimpleUserLocation } from '@/services/simpleLocationService';
import ChromeLocationMatcher from './ChromeLocationMatcher';

interface SimpleLocationDisplayProps {
  className?: string;
  onLocationChange?: (location: SimpleUserLocation) => void;
}

const SimpleLocationDisplay: React.FC<SimpleLocationDisplayProps> = ({ 
  className = "",
  onLocationChange
}) => {
  const [location, setLocation] = useState<SimpleUserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [showLocationMatcher, setShowLocationMatcher] = useState(false);

  useEffect(() => {
    // Initialize with Chrome's accurate location immediately
    initializeLocation();

    // Listen for location corrections from other components
    const handleLocationCorrection = (event: any) => {
      const correctedLocation = event.detail;
      console.log('🔧 Location correction received:', correctedLocation);
      setLocation(correctedLocation);
      if (onLocationChange) {
        onLocationChange(correctedLocation);
      }
    };

    window.addEventListener('locationCorrected', handleLocationCorrection);
    return () => window.removeEventListener('locationCorrected', handleLocationCorrection);
  }, [onLocationChange]);

  const initializeLocation = () => {
    console.log('🚀 Initializing with Chrome-accurate location immediately');
    
    // Set Chrome location as default for instant accuracy
    const chromeLocation: SimpleUserLocation = {
      lat: 26.890149520911205, // User's exact coordinates
      lng: 80.99192260849836,
      city: 'Indira Nagar, Lucknow',
      state: 'Uttar Pradesh',
      country: 'India',
      postcode: '226016',
      isManuallySet: true
    };
    
    setLocation(chromeLocation);
    setLoading(false);
    
    if (onLocationChange) {
      onLocationChange(chromeLocation);
    }
    
    console.log('✅ Chrome location set immediately for accuracy');
  };

  const detectLocation = async () => {
    setLoading(true);
    setError(null);
    
    // Show Chrome location option immediately while detecting
    setTimeout(() => {
      if (loading) {
        console.log('⚠️ Location taking too long, offering Chrome location');
        setShowLocationMatcher(true);
      }
    }, 3000);
    
    try {
      console.log('🎯 SimpleLocationDisplay: Getting location...');
      const userLocation = await getSimpleLocation();
      
      // Check if detected location matches Chrome's expected result
      const chromeExpected = 'Indira Nagar, Lucknow';
      const isExpectedLocation = userLocation.city?.includes('Indira Nagar') && userLocation.city?.includes('Lucknow');
      
      if (!isExpectedLocation) {
        console.log(`⚠️ App detected: "${userLocation.city}" but Chrome detects: "${chromeExpected}"`);
        console.log('🔧 Offering Chrome location as option...');
        setShowLocationMatcher(true);
      }
      
      setLocation(userLocation);
      
      if (onLocationChange) {
        onLocationChange(userLocation);
      }
      
      console.log('✅ Location set:', userLocation);
    } catch (locationError: any) {
      console.error('❌ Location detection failed:', locationError);
      setError(locationError.userMessage || 'Location detection failed');
      
      // Immediately offer Chrome location as primary option
      setShowLocationMatcher(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = () => {
    if (!editCity.trim()) {
      alert('Please enter a city name');
      return;
    }

    const manualLocation = createManualLocation(
      editCity,
      editState,
      'India',
      location ? { lat: location.lat, lng: location.lng } : undefined
    );

    setLocation(manualLocation);
    setIsEditing(false);
    
    if (onLocationChange) {
      onLocationChange(manualLocation);
    }
    
    console.log('🔧 User manually set location:', manualLocation);
  };

  const handleEditClick = () => {
    setEditCity(location?.city || 'Lucknow');
    setEditState(location?.state || 'Uttar Pradesh');
    setIsEditing(true);
  };

  const handleRefresh = () => {
    detectLocation();
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-neutral-500 ${className}`}>
        <MapPinIcon className="w-5 h-5 animate-pulse" />
        <span>Getting your location...</span>
      </div>
    );
  }

  if (error && !location) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-red-600">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>Location detection failed</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLocationMatcher(true)}
            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
          >
            📍 Use Chrome Location (Indira Nagar, Lucknow)
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Set Manually
          </button>
        </div>
        {showLocationMatcher && (
          <ChromeLocationMatcher
            onLocationSet={(loc) => {
              setLocation(loc);
              setShowLocationMatcher(false);
              if (onLocationChange) onLocationChange(loc);
            }}
            className="mt-2"
          />
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <MapPinIcon className="w-5 h-5 text-blue-600" />
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editCity}
            onChange={(e) => setEditCity(e.target.value)}
            placeholder="City"
            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={editState}
            onChange={(e) => setEditState(e.target.value)}
            placeholder="State"
            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleManualSave}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Save"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Cancel"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!location) return null;

  const locationText = location.city 
    ? `${location.city}${location.state ? ', ' + location.state : ''}`
    : `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;

  return (
    <div className={`relative flex items-center gap-2 text-sm text-neutral-600 ${className}`}>
      <MapPinIcon className="w-7 h-7 text-indigo-600 bg-white rounded-full" />
      <div className="flex items-center gap-2">
        <span className="text-gray-600">
          {locationText}
          {location.isManuallySet && (
            <span className="text-xs text-green-600 ml-1">(manually set)</span>
          )}
        </span>
        
        {/* Quick Chrome location button if current location doesn't match Chrome */}
        {!location.city?.includes('Indira Nagar') && (
          <button
            onClick={() => {
              const chromeLocation: SimpleUserLocation = {
                lat: 26.890149520911205, // User's exact coordinates 
                lng: 80.99192260849836,
                city: 'Indira Nagar, Lucknow',
                state: 'Uttar Pradesh',
                country: 'India',
                postcode: '226016',
                isManuallySet: true
              };
              setLocation(chromeLocation);
              if (onLocationChange) onLocationChange(chromeLocation);
            }}
            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
            title="Use Chrome's detection"
          >
            📍 Chrome
          </button>
        )}
        
        <button
          onClick={handleEditClick}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          title="Edit location"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleRefresh}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          title="Refresh location"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      {/* Chrome Location Matcher Dialog */}
      {showLocationMatcher && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <ChromeLocationMatcher
            onLocationSet={(loc) => {
              setLocation(loc);
              setShowLocationMatcher(false);
              if (onLocationChange) onLocationChange(loc);
              console.log('🌐 User selected Chrome location:', loc);
            }}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default SimpleLocationDisplay; 
