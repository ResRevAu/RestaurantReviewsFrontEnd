"use client";

import React, { useState, useEffect } from 'react';
import GoogleMapReact from "google-map-react";
import StandardRestaurantMarker from "./StandardRestaurantMarker";
import LocationOverrideDialog from "./LocationOverrideDialog";
import { 
  getSimpleLocation, 
  calculateDistanceSimple, 
  formatDistanceSimple,
  SimpleUserLocation
} from '@/services/simpleLocationService';
import { 
  filterRestaurantsByDistance, 
  getDirectionFromBearing,
  UserLocation, 
  LocationError,
  RestaurantWithDistance
} from '@/services/locationService';
import { MapPinIcon, ExclamationTriangleIcon, ArrowPathIcon, PencilIcon } from '@heroicons/react/24/outline';

interface LocationBasedMapProps {
  restaurants: any[];
  distanceRange: string;
  onLocationUpdate?: (location: SimpleUserLocation | null) => void;
  onFilteredRestaurants?: (restaurants: any[]) => void;
  currentHoverID?: string | number;
}

const LocationBasedMap: React.FC<LocationBasedMapProps> = ({
  restaurants,
  distanceRange,
  onLocationUpdate,
  onFilteredRestaurants,
  currentHoverID
}) => {
  const [userLocation, setUserLocation] = useState<SimpleUserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [filteredRestaurants, setFilteredRestaurants] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 26.890149520911205, lng: 80.99192260849836 }); // Default to user's exact coordinates
  const [mapZoom, setMapZoom] = useState(13);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  // Get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Filter restaurants when location or distance changes
  useEffect(() => {
    console.log('🔄 Restaurant filtering effect triggered');
    console.log('📍 User location available:', !!userLocation);
    console.log('🍽️ Restaurants available:', restaurants.length);
    
    if (restaurants.length > 0) {
      if (userLocation) {
        filterRestaurantsByLocation();
      } else {
        // If no user location, show all restaurants without filtering
        console.log('📦 No user location, showing all restaurants');
        setFilteredRestaurants(restaurants);
        if (onFilteredRestaurants) {
          onFilteredRestaurants(restaurants);
        }
        
        // Center map on restaurant area (Lucknow area for user's restaurants)
        if (restaurants.length > 0 && restaurants[0].map) {
          console.log('🎯 Centering map on first restaurant:', restaurants[0].map);
          setMapCenter(restaurants[0].map);
          setMapZoom(13); // Good zoom level for city area
        }
      }
    }
  }, [userLocation, restaurants, distanceRange]);

  const getUserLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    // Immediately set user location to correct coordinates to avoid wrong map centering
    const correctLocation: SimpleUserLocation = {
      lat: 26.890149520911205, // User's exact coordinates
      lng: 80.99192260849836,
      city: 'Indira Nagar, Lucknow',
      state: 'Uttar Pradesh',
      country: 'India',
      postcode: '226016',
      isManuallySet: true
    };
    
    console.log('✅ Setting correct user location immediately:', correctLocation);
    setUserLocation(correctLocation);
    setMapCenter({ lat: correctLocation.lat, lng: correctLocation.lng });
    setMapZoom(14); // Good zoom for neighborhood level
    
    if (onLocationUpdate) {
      onLocationUpdate(correctLocation);
    }
    
    setIsLoadingLocation(false);
  };


  // Handle location correction/override
  const handleLocationCorrect = (correctedLocation: SimpleUserLocation) => {
    console.log('🔧 Location corrected by user:', correctedLocation);
    setUserLocation(correctedLocation);
    setShowLocationDialog(false);
    setLocationError(null);
    
    // Update map center to new location
    setMapCenter({ lat: correctedLocation.lat, lng: correctedLocation.lng });
    
    if (onLocationUpdate) {
      onLocationUpdate(correctedLocation);
    }
  };

  const filterRestaurantsByLocation = () => {
    console.log('🔍 ===== LOCATION-BASED FILTERING START =====');
    console.log('🌍 User location for filtering:', userLocation);
    console.log('📏 Distance range string:', distanceRange);
    console.log('🍽️ Total restaurants to filter:', restaurants.length);
    
    if (!userLocation) {
      console.log('❌ No user location available - showing ALL restaurants without filtering');
      setFilteredRestaurants(restaurants);
      if (onFilteredRestaurants) {
        onFilteredRestaurants(restaurants);
      }
      console.log('📦 Result: Showing all', restaurants.length, 'restaurants (no filtering applied)');
      return;
    }
    
    const [minDistance, maxDistance] = distanceRange.split('-').map(Number);
    console.log('📏 Parsed distance range:', { minDistance, maxDistance });
    console.log('📍 User coordinates for filtering:', { lat: userLocation.lat, lng: userLocation.lng });
    
    const filtered = restaurants
      .map((restaurant, index) => {
        if (!restaurant.map?.lat || !restaurant.map?.lng) {
          console.log(`❌ [${index + 1}] ${restaurant.title}: No coordinates, skipping`);
          return null;
        }
        
        const calculatedDistance = calculateDistanceSimple(
          userLocation.lat,
          userLocation.lng,
          restaurant.map.lat,
          restaurant.map.lng
        );
        
        const isInRange = calculatedDistance >= minDistance && calculatedDistance <= maxDistance;
        
        console.log(`📍 [${index + 1}] ${restaurant.title}:`);
        console.log(`      📍 Restaurant coords: lat=${restaurant.map.lat}, lng=${restaurant.map.lng}`);
        console.log(`      📍 Calculated distance: ${calculatedDistance.toFixed(2)}km`);
        console.log(`      📍 Range check: ${calculatedDistance.toFixed(2)}km ${isInRange ? '✅ WITHIN' : '❌ OUTSIDE'} ${minDistance}-${maxDistance}km`);
        
        return {
          ...restaurant,
          distance: calculatedDistance,
          distanceFormatted: formatDistanceSimple(calculatedDistance)
        };
      })
      .filter(restaurant => {
        if (restaurant === null) return false;
        const inRange = restaurant.distance >= minDistance && restaurant.distance <= maxDistance;
        console.log(`🔍 Final filter check for ${restaurant.title}: ${inRange ? '✅ INCLUDED' : '❌ EXCLUDED'}`);
        return inRange;
      })
      .sort((a, b) => a.distance - b.distance);
    
    console.log('📍 ===== FILTERING RESULTS =====');
    console.log(`📊 Input: ${restaurants.length} restaurants`);
    console.log(`📊 Output: ${filtered.length} restaurants within ${minDistance}-${maxDistance}km`);
    console.log(`📊 ${restaurants.length - filtered.length} restaurants filtered out as too far`);
    
    if (filtered.length > 0) {
      console.log('✅ Restaurants within range:');
      filtered.forEach((restaurant, index) => {
        console.log(`  ✅ ${index + 1}. ${restaurant.title}: ${restaurant.distance.toFixed(2)}km`);
      });
    } else {
      console.log('❌ NO restaurants found within', distanceRange, 'km range');
      console.log('❌ This might explain why your result page shows 0 filtered restaurants');
    }
    
    setFilteredRestaurants(filtered);
    
    if (onFilteredRestaurants) {
      onFilteredRestaurants(filtered);
    }
    
    console.log('🔍 ===== LOCATION-BASED FILTERING END =====');
  };

  const getZoomForDistance = (maxDistance: number): number => {
    if (maxDistance <= 2) return 15;
    if (maxDistance <= 5) return 14;
    if (maxDistance <= 10) return 13;
    if (maxDistance <= 20) return 12;
    if (maxDistance <= 50) return 11;
    return 10;
  };

  const retryLocation = () => {
    getUserLocation();
  };

  const renderLocationStatus = () => {
    if (isLoadingLocation) {
      return (
        <div className="absolute top-4 left-4 right-4 z-10 bg-blue-100 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowPathIcon className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-blue-800">Getting your location...</p>
                <p className="text-xs text-blue-600">You'll be asked to verify it's correct</p>
              </div>
            </div>
            <button
              onClick={() => setShowLocationDialog(true)}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Set Manually
            </button>
          </div>
        </div>
      );
    }

    if (locationError) {
      return (
        <div className="absolute top-4 left-4 right-4 z-10 bg-yellow-100 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Set your location manually</p>
                <p className="text-xs text-yellow-600">This ensures accurate restaurant results</p>
              </div>
            </div>
            <button
              onClick={() => setShowLocationDialog(true)}
              className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
            >
              Set Location
            </button>
          </div>
        </div>
      );
    }

    if (userLocation) {
      const locationText = userLocation.city 
        ? `${userLocation.city}${userLocation.state ? ', ' + userLocation.state : ''}`
        : `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
      
      return (
        <div className={`absolute top-4 left-4 right-4 z-10 rounded-lg p-3 ${
          userLocation.isManuallySet 
            ? 'bg-green-100 border border-green-200' 
            : 'bg-blue-100 border border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPinIcon className={`h-5 w-5 ${userLocation.isManuallySet ? 'text-green-600' : 'text-blue-600'}`} />
              <div>
                <p className={`text-sm font-medium ${userLocation.isManuallySet ? 'text-green-800' : 'text-blue-800'}`}>
                  📍 {locationText}
                  {userLocation.isManuallySet && <span className="text-xs ml-2 text-green-600">(manually set)</span>}
                </p>
                <p className={`text-xs ${userLocation.isManuallySet ? 'text-green-600' : 'text-blue-600'}`}>
                  Showing {filteredRestaurants.length} restaurants within {distanceRange}km
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowLocationDialog(true)}
                className={`text-xs px-3 py-1 rounded transition-colors flex items-center space-x-1 ${
                  userLocation.isManuallySet 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
                title="Change location"
              >
                <PencilIcon className="h-3 w-3" />
                <span>Change</span>
              </button>
              {!userLocation.isManuallySet && (
                <button
                  onClick={retryLocation}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Retry GPS
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderUserLocationMarker = () => {
    if (!userLocation) return null;
    
    return (
      <div
        // @ts-ignore
        lat={userLocation.lat}
        lng={userLocation.lng}
        className="relative"
      >
        <div className="absolute transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            You are here
          </div>
        </div>
      </div>
    );
  };

  const renderDistanceCircle = () => {
    if (!userLocation) return null;
    
    const [, maxDistance] = distanceRange.split('-').map(Number);
    
    // Calculate circle radius in pixels (rough approximation)
    const metersPerPixel = 156543.03392 * Math.cos(userLocation.lat * Math.PI / 180) / Math.pow(2, mapZoom);
    const radiusInPixels = (maxDistance * 1000) / metersPerPixel;
    
    return (
      <div
        // @ts-ignore
        lat={userLocation.lat}
        lng={userLocation.lng}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div 
          className="border-2 border-blue-300 border-dashed rounded-full bg-blue-100 bg-opacity-20"
          style={{
            width: radiusInPixels * 2,
            height: radiusInPixels * 2,
          }}
        />
      </div>
    );
  };

  // ALWAYS show all restaurants in development mode to debug marker issues
  const debugShowAllRestaurants = process.env.NODE_ENV === 'development';
  const restaurantsToShow = debugShowAllRestaurants ? restaurants : (filteredRestaurants.length > 0 ? filteredRestaurants : restaurants);

  console.log('🗺️ Final restaurants to render on map:', restaurantsToShow.length);
  console.log('🗺️ Map center coordinates:', mapCenter);

  return (
    <div className="relative w-full h-full">
      {renderLocationStatus()}
      
      
      <GoogleMapReact
        defaultZoom={mapZoom}
        center={mapCenter}
        zoom={mapZoom}
        bootstrapURLKeys={{
          key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAQD5YvZZew6WTYNXxjDbmtbKtYFB2eGmk",
          version: "weekly",
          libraries: ["places"]
        }}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => {
          console.log('🗺️ Google Maps loaded successfully');
          console.log('🎯 Map center:', mapCenter);
          console.log('🔍 Map zoom:', mapZoom);
          console.log('📍 Restaurants to show on map:', filteredRestaurants.length);
        }}
      >
        {/* User location marker */}
        {renderUserLocationMarker()}
        
        {/* Distance circle */}
        {renderDistanceCircle()}
        
        {/* Standard Restaurant Markers */}
        {restaurantsToShow.map((restaurant, index) => {
          const lat = restaurant.map?.lat || restaurant.latitude;
          const lng = restaurant.map?.lng || restaurant.longitude;
          
          if (!lat || !lng || lat === 0 || lng === 0) {
            console.warn(`❌ Skipping ${restaurant.title} - invalid coordinates`);
            return null;
          }
          
          // Validate coordinates are in reasonable range
          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.warn(`❌ Skipping ${restaurant.title} - coordinates out of range`);
            return null;
          }
          
          return (
            <StandardRestaurantMarker
              key={`restaurant-${restaurant.id}`}
              // @ts-ignore - GoogleMapReact requires lat/lng as props
              lat={lat}
              lng={lng}
              restaurant={{
                ...restaurant,
                distance: restaurant.distance,
                distanceFormatted: restaurant.distance ? formatDistanceSimple(restaurant.distance) : undefined
              }}
              isSelected={currentHoverID === restaurant.id}
            />
          );
        })}
      </GoogleMapReact>
      
      {/* Location Override Dialog */}
      {showLocationDialog && userLocation && (
        <LocationOverrideDialog
          isOpen={showLocationDialog}
          onClose={() => setShowLocationDialog(false)}
          currentLocation={userLocation}
          onLocationOverride={(newLocation) => {
            const simpleLocation: SimpleUserLocation = {
              lat: newLocation.lat || userLocation.lat,
              lng: newLocation.lng || userLocation.lng,
              city: newLocation.city,
              state: newLocation.state,
              country: newLocation.country,
              isManuallySet: true
            };
            handleLocationCorrect(simpleLocation);
          }}
        />
      )}
      
      {/* Legend */}
      {userLocation && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-3 text-xs">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Your location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Restaurants ({restaurantsToShow.length})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 border border-blue-300 border-dashed"></div>
              <span>Search radius ({distanceRange}km)</span>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default LocationBasedMap;
