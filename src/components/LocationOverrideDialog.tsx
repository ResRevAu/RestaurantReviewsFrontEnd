"use client";

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MapPinIcon, MagnifyingGlassIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { UserLocation, getCurrentLocation } from '@/services/locationService';

interface LocationOverrideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: UserLocation;
  onLocationOverride: (newLocation: UserLocation) => void;
}

const LocationOverrideDialog: React.FC<LocationOverrideDialogProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onLocationOverride
}) => {
  const [manualCity, setManualCity] = useState(currentLocation.city || '');
  const [manualState, setManualState] = useState(currentLocation.state || '');
  const [manualCountry, setManualCountry] = useState(currentLocation.country || '');
  const [isSearching, setIsSearching] = useState(false);

  const handleSave = () => {
    if (!manualCity.trim()) {
      alert('Please enter a city name');
      return;
    }

    const correctedLocation: UserLocation = {
      ...currentLocation,
      city: manualCity.trim(),
      state: manualState.trim() || currentLocation.state,
      country: manualCountry.trim() || currentLocation.country
    };

    console.log('🔧 User manually corrected location:', correctedLocation);
    onLocationOverride(correctedLocation);
    onClose();
  };

  const handleRetryGPS = async () => {
    setIsSearching(true);
    try {
      console.log('🔄 Retrying GPS location...');
      const newLocation = await getCurrentLocation();
      console.log('✅ New GPS location:', newLocation);
      
      // Update form with new location
      setManualCity(newLocation.city || '');
      setManualState(newLocation.state || '');
      setManualCountry(newLocation.country || '');
      
      onLocationOverride(newLocation);
      onClose();
    } catch (error) {
      console.error('❌ GPS retry failed:', error);
      alert('Unable to get GPS location. Please enter your location manually.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <MapPinIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        Correct Your Location
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">
                        Help us show you the most relevant restaurants
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                {/* Current Detection Info */}
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Current detected location:</p>
                      <p className="text-sm text-yellow-700">
                        {currentLocation.city || 'Unknown City'}
                        {currentLocation.state && `, ${currentLocation.state}`}
                        {currentLocation.country && `, ${currentLocation.country}`}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        GPS: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                        {currentLocation.accuracy && ` (±${Math.round(currentLocation.accuracy)}m)`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manual Location Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      placeholder="Enter your city (e.g., Lucknow, New York, London)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Region
                      </label>
                      <input
                        type="text"
                        value={manualState}
                        onChange={(e) => setManualState(e.target.value)}
                        placeholder="e.g., UP, NY, England"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={manualCountry}
                        onChange={(e) => setManualCountry(e.target.value)}
                        placeholder="e.g., India, USA, UK"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleRetryGPS}
                    disabled={isSearching}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <MagnifyingGlassIcon className={`h-4 w-4 ${isSearching ? 'animate-spin' : ''}`} />
                    <span>{isSearching ? 'Retrying...' : 'Retry GPS'}</span>
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      onClick={handleSave}
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span>Save Location</span>
                    </button>
                  </div>
                </div>

                {/* Helpful Tips */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2 font-medium">💡 Tips for accurate location:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Make sure location services are enabled in your browser</li>
                    <li>• Move to an open area away from tall buildings</li>
                    <li>• Allow the GPS to get a more accurate reading</li>
                    <li>• Enter your city name exactly as you know it</li>
                  </ul>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LocationOverrideDialog;
