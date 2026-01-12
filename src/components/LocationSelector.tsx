"use client";

import React, { FC, useState, useRef, useEffect } from "react";
import { MapPinIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Loader } from "@googlemaps/js-api-loader";

interface LocationData {
  postcode: string;
  locality: string;
  state: string;
  country?: string;
}

interface LocationSelectorProps {
  onSelect?: (locations: LocationData[]) => void;
}

interface GeocodingResult {
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

const MAX_RECENT_SEARCHES = 5;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAQD5YvZZew6WTYNXxjDbmtbKtYFB2eGmk";

const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["places"]
});

const LocationSelector: FC<LocationSelectorProps> = ({ onSelect }) => {
  const [showPopover, setShowPopover] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocations, setSelectedLocations] = useState<LocationData[]>([]);
  const [recentSearches, setRecentSearches] = useState<LocationData[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const savedRecent = localStorage.getItem('recentLocationSearches');
    if (savedRecent) {
      setRecentSearches(JSON.parse(savedRecent));
    }
  }, []);

  // Load CSV data
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/australian_postcodes.csv');
        const text = await response.text();
        const lines = text.trim().split('\n');
        const data = lines.slice(1).map(line => {
          const [postcode, locality, state] = line.split(',').map(item => item.trim());
          return { postcode, locality, state };
        });
        setLocations(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading locations:', error);
        setIsLoading(false);
      }
    };
    loadLocations();
  }, []);

  // Filter locations based on search
  useEffect(() => {
    if (searchValue.trim()) {
      const searchTerm = searchValue.toLowerCase().trim();
      const filtered = locations.filter(location => {
        return location.locality.toLowerCase().includes(searchTerm) ||
               location.postcode.includes(searchTerm) ||
               location.state.toLowerCase().includes(searchTerm);
      });
      setFilteredLocations(filtered.slice(0, 10));
    } else {
      setFilteredLocations([]);
    }
  }, [searchValue, locations]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPopover(false);
        setShowTooltip(false);
      }
    };

    if (showPopover || showTooltip) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPopover, showTooltip]);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Load Google Maps Geocoding
            const google = await loader.load();
            const geocoder = new google.maps.Geocoder();
            
            // Get address using Google Maps Geocoding
            const response = await new Promise<GeocodingResult>((resolve, reject) => {
              geocoder.geocode(
                { location: { lat: latitude, lng: longitude } },
                (results: any[] | null, status: string) => {
                  if (status === "OK" && results && results.length > 0) {
                    resolve(results[0]);
                  } else {
                    reject(new Error("Geocoding failed"));
                  }
                }
              );
            });

            // Parse the geocoding result
            let locality = "", state = "", country = "", postcode = "";

            // Extract components from address
            response.address_components?.forEach((component) => {
              const types = component.types;
              if (types.includes("locality") || types.includes("sublocality")) {
                locality = component.long_name;
              } else if (types.includes("administrative_area_level_1")) {
                state = component.long_name;
              } else if (types.includes("country")) {
                country = component.long_name;
              } else if (types.includes("postal_code")) {
                postcode = component.long_name;
              }
            });

            const currentLocation = {
              postcode: postcode || "N/A",
              locality: locality || "Unknown Location",
              state: state || "",
              country: country || ""
            };

            // Update selected locations
            if (!selectedLocations.some(loc => loc.locality === currentLocation.locality)) {
              const newSelected = [currentLocation, ...selectedLocations];
              setSelectedLocations(newSelected);
              if (onSelect) {
                onSelect(newSelected);
              }
            }

            // Update recent searches
            const newRecent = [currentLocation, ...recentSearches.filter(item => 
              item.locality !== currentLocation.locality
            )].slice(0, MAX_RECENT_SEARCHES);
            setRecentSearches(newRecent);
            localStorage.setItem('recentLocationSearches', JSON.stringify(newRecent));

          } catch (error) {
            console.error('Error getting location:', error);
            // Fallback to IP-based geolocation if Google Geocoding fails
            try {
              const response = await fetch('https://ipapi.co/json/');
              const data = await response.json();
              
              const currentLocation = {
                postcode: data.postal || "N/A",
                locality: data.city || "Unknown Location",
                state: data.region || "",
                country: data.country_name || ""
              };

              // Update selected locations
              if (!selectedLocations.some(loc => loc.locality === currentLocation.locality)) {
                const newSelected = [currentLocation, ...selectedLocations];
                setSelectedLocations(newSelected);
                if (onSelect) {
                  onSelect(newSelected);
                }
              }

              // Update recent searches
              const newRecent = [currentLocation, ...recentSearches.filter(item => 
                item.locality !== currentLocation.locality
              )].slice(0, MAX_RECENT_SEARCHES);
              setRecentSearches(newRecent);
              localStorage.setItem('recentLocationSearches', JSON.stringify(newRecent));

            } catch (ipError) {
              console.error('Error getting IP location:', ipError);
            }
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  };

  const handleLocationSelect = (location: LocationData) => {
    if (!selectedLocations.some(sel => sel.locality === location.locality)) {
      const newSelected = [...selectedLocations, location];
      setSelectedLocations(newSelected);
      
      // Update recent searches
      const newRecent = [location, ...recentSearches.filter(item => 
        item.locality !== location.locality
      )].slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(newRecent);
      localStorage.setItem('recentLocationSearches', JSON.stringify(newRecent));

      if (onSelect) {
        onSelect(newSelected);
      }
    }
  };

  const removeLocation = (location: LocationData, e?: React.MouseEvent) => {
    // Prevent event bubbling to keep dropdown open
    e?.stopPropagation();
    
    const newSelected = selectedLocations.filter(sel => sel.locality !== location.locality);
    setSelectedLocations(newSelected);
    if (onSelect) {
      onSelect(newSelected);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setShowPopover(!showPopover)}
        onMouseEnter={() => selectedLocations.length > 1 && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-1.5 px-1 py-1.5 border-2 border-indigo-200 hover:border-indigo-300 rounded-lg text-sm text-neutral-600 whitespace-nowrap transition-all hover:bg-gray-50 min-w-[200px]"
      >
        <MapPinIcon className="w-5 h-5 stroke-2 text-neutral-500 flex-shrink-0" />
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {selectedLocations.length > 0 ? (
            <>
              <span className="font-medium truncate">
                {selectedLocations[0].locality}
              </span>
              {selectedLocations.length > 1 && (
                <span className="text-xs text-neutral-500">
                  (+{selectedLocations.length - 1})
                </span>
              )}
            </>
          ) : (
            <span className="font-medium truncate">Select Location</span>
          )}
        </div>
        <svg className="w-4 h-4 ml-1 text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Tooltip */}
      {showTooltip && selectedLocations.length > 1 && (
        <div className="absolute z-[9999] w-80 bg-white mt-2 py-2 px-3 rounded-lg shadow-lg">
          <div className="text-sm font-medium mb-2">Selected Locations:</div>
          {selectedLocations.map((loc) => (
            <div key={loc.locality} className="flex items-center justify-between py-1 text-sm">
              <span>{loc.locality} {loc.state && `(${loc.state}${loc.country ? `, ${loc.country}` : ''})`}</span>
              <XMarkIcon 
                className="w-4 h-4 cursor-pointer text-neutral-400 hover:text-neutral-600" 
                onClick={(e) => removeLocation(loc, e)}
              />
            </div>
          ))}
        </div>
      )}

      {showPopover && (
        <div className="absolute z-[9999] w-80 bg-white mt-2 py-3 rounded-xl shadow-xl">
          {/* Current Location Button */}
          <div className="px-4 pb-3 border-b border-neutral-200">
            <button
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
            >
              <MapPinIcon className="w-5 h-5" />
              {isLoadingLocation ? 'Getting location...' : 'Update Current Location'}
            </button>
          </div>

          {/* Search Input */}
          <div className="px-4 py-3 border-b border-neutral-200">
            <input
              type="text"
              placeholder="Search locations..."
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          {/* Selected Locations */}
          {selectedLocations.length > 0 && (
            <div className="px-4 py-2 border-b border-neutral-200">
              <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">Selected</div>
              <div className="flex flex-wrap gap-2">
                {selectedLocations.map((loc) => (
                  <span key={loc.locality} className="flex items-center bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-xs">
                    {loc.locality}
                    <XMarkIcon 
                      className="w-3 h-3 ml-1 cursor-pointer hover:text-indigo-900" 
                      onClick={(e) => removeLocation(loc, e)}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-neutral-300">
            {isLoading ? (
              <div className="px-4 py-3 text-neutral-500">Loading locations...</div>
            ) : (
              <>
                {/* Search Results */}
                {filteredLocations.length > 0 && (
                  <div className="mb-4">
                    <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase">Search Results</div>
                    {filteredLocations.map((location) => (
                      <div
                        key={`${location.postcode}-${location.locality}`}
                        className="px-4 py-2 hover:bg-neutral-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLocationSelect(location);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4 text-neutral-400" />
                          <span>{location.locality} ({location.state})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {!searchValue && recentSearches.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase">Recent Searches</div>
                    {recentSearches.map((location) => (
                      <div
                        key={`recent-${location.locality}`}
                        className="px-4 py-2 hover:bg-neutral-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLocationSelect(location);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-neutral-400" />
                          <span>{location.locality} {location.state && `(${location.state}${location.country ? `, ${location.country}` : ''})`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results Message */}
                {searchValue && filteredLocations.length === 0 && (
                  <div className="px-4 py-3 text-neutral-500">No locations found</div>
                )}

                {/* Initial State Message */}
                {!searchValue && recentSearches.length === 0 && (
                  <div className="px-4 py-3 text-neutral-500">Type to search locations</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector; 