"use client";

import React, { useEffect, useState } from 'react';
import { MapPinIcon, ExclamationTriangleIcon, PencilIcon } from "@heroicons/react/24/outline";
import { getCurrentLocation, UserLocation, LocationError, assessLocationAccuracy } from '@/services/locationService';
import LocationOverrideDialog from './LocationOverrideDialog';

interface CurrentLocationDisplayProps {
  className?: string;
}

const CurrentLocationDisplay: React.FC<CurrentLocationDisplayProps> = ({ className = "" }) => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocationAccurate, setIsLocationAccurate] = useState(true);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  useEffect(() => {
    const getLocation = async () => {
      try {
        console.log('📍 CurrentLocationDisplay: Getting location...');
        const userLocation = await getCurrentLocation();
        
        console.log('✅ CurrentLocationDisplay: Location received:', userLocation);
        setLocation(userLocation);
        
        // Assess location accuracy globally
        const accuracyAssessment = assessLocationAccuracy(userLocation);
        setIsLocationAccurate(accuracyAssessment.isAccurate);
        
        console.log('📊 Location accuracy assessment:', accuracyAssessment);
        
        if (!accuracyAssessment.isAccurate) {
          console.log('⚠️ Location accuracy concerns:', accuracyAssessment.recommendations);
        }
        
      } catch (locationError) {
        console.error('❌ CurrentLocationDisplay: Location error:', locationError);
        const err = locationError as LocationError;
        setError(err.userMessage || 'Unable to get your location');
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  const handleLocationOverride = (newLocation: UserLocation) => {
    console.log('🔧 Location overridden in CurrentLocationDisplay:', newLocation);
    setLocation(newLocation);
    setIsLocationAccurate(true); // Assume manual correction is accurate
    setShowLocationDialog(false);
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-neutral-500 ${className}`}>
        <MapPinIcon className="w-4 h-4 animate-pulse" />
        <span>Getting your location...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-sm text-neutral-500 ${className}`}>
        <MapPinIcon className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  if (!location) return null;

  return (
    <>
      <div className={`flex items-center gap-2 text-sm text-neutral-600 ${className}`}>
        <div className="relative">
          <MapPinIcon className="w-7 h-7 text-indigo-600 font-bold bg-white rounded-full" />
          {!isLocationAccurate && (
            <ExclamationTriangleIcon className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 bg-white rounded-full" />
          )}
        </div>
        <div className="flex-grow">
          <div className="flex items-center space-x-2">
            <span className="truncate text-gray-600">
              {location.city ? 
                `${location.city}${location.state ? `, ${location.state}` : ''}${location.postcode ? ` ${location.postcode}` : ''}` 
                : 
                `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
              }
            </span>
            <button
              onClick={() => setShowLocationDialog(true)}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Correct location"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </div>
          {!isLocationAccurate && (
            <div className="text-xs text-yellow-600 mt-1 flex items-center space-x-1">
              <ExclamationTriangleIcon className="w-3 h-3" />
              <span>Location may be imprecise - click to correct</span>
            </div>
          )}
        </div>
      </div>

      {/* Location Override Dialog */}
      {showLocationDialog && location && (
        <LocationOverrideDialog
          isOpen={showLocationDialog}
          onClose={() => setShowLocationDialog(false)}
          currentLocation={location}
          onLocationOverride={handleLocationOverride}
        />
      )}
    </>
  );
};

export default CurrentLocationDisplay; 