"use client";

import React, { FC, useEffect, useState } from "react";
import AnyReactComponent from "@/components/AnyReactComponent/AnyReactComponent";
import GoogleMapReact from "google-map-react";
import { DEMO_STAY_LISTINGS } from "@/data/listings";
import ButtonClose from "@/shared/ButtonClose";
import Checkbox from "@/shared/Checkbox";
import Pagination from "@/shared/Pagination";
import TabFilters from "./TabFilters";
import Heading2 from "@/shared/Heading2";
import StayCard2 from "@/components/StayCard2";
import { useSearchParams, useRouter } from "next/navigation";
import { MapPinIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon, HomeIcon, GlobeAsiaAustraliaIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { searchRestaurants, convertRestaurantToStayCard, getMockRestaurants, RestaurantSearchParams } from "@/services/restaurantApi";
import LocationBasedMap from "@/components/LocationBasedMap";
import ApiEndpointTester from "@/components/ApiEndpointTester";
import { UserLocation, RestaurantWithDistance, formatDistance } from "@/services/locationService";
import { SimpleUserLocation, formatDistanceSimple } from "@/services/simpleLocationService";

// Global event for dropdown controls without URL params
const triggerDropdownOpen = (type: 'filter' | 'distance' | 'property') => {
  // Create and dispatch a custom event
  const event = new CustomEvent('openSearchDropdown', { detail: { type } });
  window.dispatchEvent(event);
};

export interface SectionGridHasMapProps { }

const SectionGridHasMap: FC<SectionGridHasMapProps> = () => {
  const [currentHoverID, setCurrentHoverID] = useState<string | number>(-1);
  const [showFullMapFixed, setShowFullMapFixed] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [userLocation, setUserLocation] = useState<SimpleUserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [apiDataSource, setApiDataSource] = useState<'API' | 'MOCK' | 'LOADING'>('LOADING');
  const router = useRouter();

  // Get search parameters from URL
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const distance = searchParams.get('distance') || '1-10';
  const category = searchParams.get('category') || '';
  const filters = searchParams.get('filters') || '';
  const type = searchParams.get('type') || '';
  const venueType = searchParams.get('venue_type') || '';
  const cuisine = searchParams.get('cuisine') || '';
  const amenity = searchParams.get('amenity') || '';
  const restaurantId = searchParams.get('restaurant_id') || '';
  const nearMe = searchParams.get('near_me') === 'true';

  // Process filters
  const filterItems = filters ? filters.split(',') : [];

  // Fetch restaurants based on search parameters
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 ===== RESTAURANT FETCH DEBUG START =====');
        console.log('🔍 Input Parameters:');
        console.log('  - Query:', query);
        console.log('  - Venue Type:', venueType);
        console.log('  - Cuisine:', cuisine);
        console.log('  - Amenity:', amenity);
        console.log('  - Type:', type);
        console.log('  - Near Me:', nearMe);
        console.log('  - Distance Range:', distance);
        console.log('  - User Location Available:', !!userLocation);
        
        if (userLocation) {
          console.log('🌍 Current User Location Being Used:');
          console.log('  - Latitude:', userLocation.lat);
          console.log('  - Longitude:', userLocation.lng);
          console.log('  - City:', userLocation.city);
          console.log('  - State:', userLocation.state);
          console.log('  - Manually Set:', userLocation.isManuallySet);
        }
        
        let restaurantData: any[] = [];
        let apiSuccessful = false;
        
        console.log('🌐 ===== ATTEMPTING REAL API CALL =====');
        
        try {
          // Build comprehensive search parameters for REAL restaurants near user's location
          const searchParams: RestaurantSearchParams & {
            userLocation?: { lat: number; lng: number; maxDistance?: number }
          } = {
            query: query || undefined,
            venue_type: venueType || undefined,
            cuisine: cuisine || undefined,
            page: 1,
            limit: 100, // High limit to get as many real restaurants as possible
            userLocation: userLocation ? {
              lat: userLocation.lat,
              lng: userLocation.lng,
              maxDistance: parseInt(distance.split('-')[1]) || 10
            } : {
              lat: 26.890149520911205, // User's coordinates as fallback
              lng: 80.99192260849836,
              maxDistance: 10
            }
          };

          console.log('📋 REAL API Search Parameters with location:', searchParams);
          console.log('🌐 Making API call to get REAL restaurants near user...');
          
          console.log('📡 ===== API CALL DETAILS =====');
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://restaurantreviews.io';
          console.log('🌐 API Base URL:', apiBaseUrl);
          console.log('🌐 Full API URL Being Called:', `${apiBaseUrl}/api/restaurants/?approved=true&limit=100`);
          console.log('🎯 Now using restaurantreviews.io as primary API endpoint');
          console.log('📍 Location Parameters Sent:');
          if (searchParams.userLocation) {
            console.log('  - User Lat:', searchParams.userLocation.lat);
            console.log('  - User Lng:', searchParams.userLocation.lng);
            console.log('  - Max Distance:', searchParams.userLocation.maxDistance);
          }
          
          const apiResponse = await searchRestaurants(searchParams);
          
          console.log('📡 ===== API RESPONSE ANALYSIS =====');
          console.log('📊 Raw API Response:', apiResponse);
          
          if (apiResponse && apiResponse.results && apiResponse.results.length > 0) {
            console.log('🎉 SUCCESS: REAL API restaurants received!');
            console.log('📊 API Response Summary:');
            console.log('  - Total Count in DB:', apiResponse.count);
            console.log('  - Results Returned:', apiResponse.results.length);
            console.log('  - Has Next Page:', !!apiResponse.next);
            console.log('  - Has Previous Page:', !!apiResponse.previous);
            
            console.log('🗺️ First 5 API Restaurant Locations:');
            apiResponse.results.slice(0, 5).forEach((restaurant, index) => {
              console.log(`  🏪 API ${index + 1}. ${restaurant.name}:`);
              console.log(`      📍 Raw Coordinates: lat=${restaurant.latitude}, lng=${restaurant.longitude}`);
              console.log(`      📍 Address: ${restaurant.street_address}, ${restaurant.city}, ${restaurant.state}`);
              console.log(`      📍 Venue Types:`, restaurant.venue_types?.map(v => v.name));
              console.log(`      📍 Approved: ${restaurant.is_approved}`);
            });
            
            // Convert REAL API restaurants to UI format
            restaurantData = apiResponse.results.map(convertRestaurantToStayCard);
            apiSuccessful = true;
            setApiDataSource('API');
            
            console.log('✅ Converted API restaurants to UI format:', restaurantData.length);
            console.log('🗺️ Converted Restaurant Map Coordinates:');
            restaurantData.slice(0, 5).forEach((restaurant, index) => {
              console.log(`  🏪 UI ${index + 1}. ${restaurant.title}:`);
              console.log(`      📍 UI Coordinates: lat=${restaurant.map?.lat}, lng=${restaurant.map?.lng}`);
              console.log(`      📍 Has Valid Coordinates: ${!!(restaurant.map?.lat && restaurant.map?.lng && restaurant.map?.lat !== 0 && restaurant.map?.lng !== 0)}`);
              console.log(`      📍 Address: ${restaurant.address}`);
            });
            
          } else {
            console.log('📦 API Response Analysis:');
            console.log('  - API Response Object:', !!apiResponse);
            console.log('  - Has Results Array:', !!(apiResponse?.results));
            console.log('  - Results Length:', apiResponse?.results?.length || 0);
            console.log('🔄 API returned no valid results, using mock data...');
          }
        } catch (apiError) {
          console.error('❌ REAL API request completely failed:', apiError);
          console.log('🔄 Falling back to mock data with your coordinates...');
        }
        
        // If API failed, use enhanced mock data filtered for user's location
        if (!apiSuccessful) {
          console.log('📦 ===== USING MOCK DATA FALLBACK =====');
          console.log('📦 Reason: API call was not successful');
          
          // Get all mock restaurants
          const allMockRestaurants = getMockRestaurants('');
          console.log('📦 Total Mock Restaurants Available:', allMockRestaurants.length);
          
          // Show mock restaurant coordinates
          console.log('🗺️ Mock Restaurant Coordinates:');
          allMockRestaurants.forEach((restaurant, index) => {
            console.log(`  🏪 MOCK ${index + 1}. ${restaurant.title}:`);
            console.log(`      📍 Coordinates: lat=${restaurant.map?.lat}, lng=${restaurant.map?.lng}`);
            console.log(`      📍 Address: ${restaurant.address}`);
          });
          
          // Use all mock restaurants (they're already in Lucknow area)
          restaurantData = allMockRestaurants;
          setApiDataSource('MOCK');
          console.log(`📍 Using all ${restaurantData.length} mock restaurants for Lucknow area`);
        }
        
        console.log('📦 ===== FINAL RESTAURANT LOADING =====');
        console.log('📊 Total restaurants being set:', restaurantData.length);
        console.log('📊 Data source:', apiSuccessful ? 'REAL API' : 'MOCK DATA');
        
        setRestaurants(restaurantData);
        
        console.log('🗺️ Final Restaurant Summary:');
        restaurantData.forEach((restaurant, index) => {
          console.log(`  🏪 FINAL ${index + 1}. ${restaurant.title}:`);
          console.log(`      📍 Final Coordinates: lat=${restaurant.map?.lat}, lng=${restaurant.map?.lng}`);
          console.log(`      📍 Address: ${restaurant.address}`);
          console.log(`      📍 Valid for Map: ${!!(restaurant.map?.lat && restaurant.map?.lng)}`);
        });
        
        console.log('🔍 ===== RESTAURANT FETCH DEBUG END =====');
        
      } catch (error) {
        console.error('❌ ===== ERROR IN RESTAURANT FETCHING =====');
        console.error('❌ Error details:', error);
        setError('Failed to load restaurants');
        
        // Always fallback to mock data with your coordinates
        const mockRestaurants = getMockRestaurants('');
        setRestaurants(mockRestaurants);
        console.log('🆘 Emergency fallback: loaded mock restaurants:', mockRestaurants.length);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [query, venueType, cuisine, amenity, type, nearMe]);

  // Use filtered restaurants data for display
  const DEMO_STAYS = filteredRestaurants.length > 0 ? filteredRestaurants : restaurants;

  // ===== COMPREHENSIVE FILTERING DEBUG =====
  console.log('🔍 ===== RESTAURANT FILTERING ANALYSIS =====');
  console.log('📊 Current State:');
  console.log('  - Raw Restaurants Loaded:', restaurants.length);
  console.log('  - Filtered Restaurants:', filteredRestaurants.length);
  console.log('  - Final Display Count:', DEMO_STAYS.length);
  console.log('  - User Location Available:', !!userLocation);
  console.log('  - Distance Range:', distance);
  
  if (userLocation) {
    console.log('📍 User Location for Filtering:');
    console.log('  - User Lat:', userLocation.lat);
    console.log('  - User Lng:', userLocation.lng);
    console.log('  - User City:', userLocation.city);
  }
  
  console.log('🗺️ Why showing', DEMO_STAYS.length, 'restaurants:');
  if (filteredRestaurants.length > 0) {
    console.log('  ✅ Using filtered restaurants (distance-based filtering worked)');
  } else {
    console.log('  📦 Using raw restaurants (filtering returned 0, showing all as fallback)');
    console.log('  📦 This explains why you see', restaurants.length, 'restaurants');
  }
  
  // Debug each restaurant's relationship to user location
  if (restaurants.length > 0 && userLocation) {
    console.log('🔍 Distance Analysis for Each Restaurant:');
    restaurants.forEach((restaurant, index) => {
      if (restaurant.map?.lat && restaurant.map?.lng) {
        const restaurantDistance = Math.sqrt(
          Math.pow(restaurant.map.lat - userLocation.lat, 2) + 
          Math.pow(restaurant.map.lng - userLocation.lng, 2)
        ) * 111; // Rough km conversion
        
        const [minDist, maxDist] = distance.split('-').map(Number);
        const maxDistance = maxDist || 10;
        const isInRange = restaurantDistance <= maxDistance;
        
        console.log(`  📍 ${index + 1}. ${restaurant.title}:`);
        console.log(`      📍 Restaurant: lat=${restaurant.map.lat}, lng=${restaurant.map.lng}`);
        console.log(`      📍 Distance: ${restaurantDistance.toFixed(2)}km`);
        console.log(`      📍 In Range (${maxDistance}km): ${isInRange ? '✅ YES' : '❌ NO'}`);
        console.log(`      📍 Should Show: ${isInRange ? 'YES' : 'NO'}`);
      } else {
        console.log(`  ❌ ${index + 1}. ${restaurant.title}: NO COORDINATES`);
      }
    });
  }
  
  console.log('🔍 ===== END FILTERING ANALYSIS =====');
  
  // ===== FINAL EXPLANATION SUMMARY =====
  console.log('🎯 ===== WHY YOU SEE', DEMO_STAYS.length, 'RESTAURANTS - EXPLANATION =====');
  
  if (apiDataSource === 'API') {
    console.log('📊 DATA SOURCE: REAL API RESTAURANTS');
    console.log('  ✅ Successfully fetched restaurants from the backend API');
    console.log('  🌐 API endpoint returned real restaurant data');
  } else if (apiDataSource === 'MOCK') {
    console.log('📊 DATA SOURCE: MOCK/FALLBACK RESTAURANTS');
    console.log('  ❌ API call failed or returned no results');
    console.log('  📦 Using mock restaurants with Lucknow coordinates as fallback');
  } else {
    console.log('📊 DATA SOURCE: STILL LOADING');
  }
  
  if (userLocation) {
    console.log('📍 LOCATION FILTERING:');
    console.log(`  🌍 Your location: ${userLocation.city} (${userLocation.lat}, ${userLocation.lng})`);
    console.log(`  📏 Distance range: ${distance} kilometers`);
    
    if (filteredRestaurants.length > 0) {
      console.log(`  ✅ ${filteredRestaurants.length} restaurants are within your distance range`);
      console.log('  ✅ Showing filtered restaurants based on your location');
    } else {
      console.log(`  ❌ 0 restaurants found within ${distance}km of your location`);
      console.log(`  📦 Fallback: Showing all ${restaurants.length} restaurants regardless of distance`);
      console.log('  📦 This is why you see more restaurants than expected');
    }
  } else {
    console.log('📍 NO LOCATION FILTERING:');
    console.log('  ❌ User location not available');
    console.log(`  📦 Showing all ${restaurants.length} restaurants without distance filtering`);
  }
  
  console.log('🎯 ===== SUMMARY =====');
  console.log(`🔢 TOTAL RESTAURANTS DISPLAYED: ${DEMO_STAYS.length}`);
  console.log(`📊 BREAKDOWN:`);
  console.log(`  - Loaded from source: ${restaurants.length} restaurants`);
  console.log(`  - After distance filtering: ${filteredRestaurants.length} restaurants`);
  console.log(`  - Final display: ${DEMO_STAYS.length} restaurants`);
  
  if (DEMO_STAYS.length > filteredRestaurants.length && filteredRestaurants.length === 0) {
    console.log('⚠️ EXPLANATION: You see more restaurants because:');
    console.log('   1. Distance filtering found 0 restaurants within range');
    console.log('   2. App falls back to showing all restaurants to avoid empty results');
    console.log('   3. This prevents users from seeing a blank page');
  }
  
  console.log('🎯 ===== END EXPLANATION =====');

  // Handle location updates
  const handleLocationUpdate = (location: SimpleUserLocation | null) => {
    setUserLocation(location);
    if (location) {
      console.log('📍 User location updated:', location);
      setLocationError(null);
    } else {
      setLocationError('Unable to get your location');
    }
  };

  // Handle filtered restaurants update
  const handleFilteredRestaurants = (filtered: RestaurantWithDistance[]) => {
    setFilteredRestaurants(filtered);
    console.log(`🔍 Restaurants filtered by distance: ${filtered.length}/${restaurants.length}`);
  };

  // Handle clicking on filter pills - scroll to top and open dropdown
  const handleFilterPillClick = (type: 'filter' | 'distance' | 'property') => {
    // Find the search form element
    const searchFormElement = document.getElementById('search-form');

    // If element found, scroll to it
    if (searchFormElement) {
      searchFormElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to top of the page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // Wait for scroll to complete before triggering the dropdown
    setTimeout(() => {
      triggerDropdownOpen(type);
    }, 800);
  };

  // Handle removing a filter
  const handleRemoveFilter = (filterToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newParams = new URLSearchParams(searchParams.toString());
    const newFilters = filterItems.filter(item => item !== filterToRemove);
    if (newFilters.length > 0) {
      newParams.set('filters', newFilters.join(','));
    } else {
      newParams.delete('filters');
    }
    const newPath = '/listing-stay-map?' + newParams.toString();
    router.push(newPath as any);
  };

  // Handle removing distance filter
  const handleRemoveDistance = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('distance');
    const newPath = '/listing-stay-map?' + newParams.toString();
    router.push(newPath as any);
  };

  // Format category label
  const getCategoryLabel = () => {
    if (!category) return 'All Categories';

    // Map of special category formats or replacements
    const categoryMap: Record<string, string> = {
      'Fast+Food': 'FAST FOOD TYPES',
      'International+Cuisine': 'INTERNATIONAL CUISINES',
      'Favourite+Foods': 'FAVOURITE FOODS',
      'Child+Friendly': 'CHILD FRIENDLY',
      'Cafés+&+Coffee': 'CAFÉS & COFFEE',
      'Todays+Specials': 'TODAY\'S SPECIALS',
      'Fine+Dining': 'FINE DINING',
      'Casual+Dining': 'CASUAL DINING',
      'Healthy+Foods': 'HEALTHY FOODS'
    };

    // Check if we have a special mapping for this category
    const formattedCategory = categoryMap[category];
    if (formattedCategory) return formattedCategory;

    // Otherwise, transform the category string by replacing '+' with space and capitalizing each word
    return category.split('+')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .toUpperCase();
  };

  // Create subheading content
  const getSearchContent = () => {
    const propertyTypes = searchParams.get('propertyTypes') || '';
    const propertyTypeItems = propertyTypes ? propertyTypes.split(',') : [];

    return (
      <div className="mt-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-end">
          <span className="text-blue-600">
            <button onClick={toggleFilters} className="text-red-900">
              {filtersVisible ? "- Minimise filters" : ""}
            </button>
          </span>
        </div>
        
        {query && (
          <div className="flex items-start mb-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="block text-neutral-600 dark:text-neutral-300 font-medium text-base">
                Search Term:
              </span>
              <span className="block mt-1 text-blue-600">
                "{query}"
              </span>
            </div>
          </div>
        )}

        {filterItems.length > 0 && (
          <div className="flex items-start mb-3">
            <GlobeAsiaAustraliaIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 mb-2 flex items-center justify-between">
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  International Cuisines:
                </span>
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {filterItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleFilterPillClick('filter')}
                  >
                    {item}
                    <button
                      className="ml-1.5 text-blue-500 hover:text-blue-700 focus:outline-none"
                      onClick={(e) => handleRemoveFilter(item, e)}
                      aria-label={`Remove ${item} filter`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {propertyTypeItems.length > 0 && (
          <div className="flex items-start mb-3">
            <HomeIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 mb-2 flex items-center justify-between">
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  Restaurant Type:
                </span>
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {propertyTypeItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-600 border border-green-200 hover:bg-green-50 cursor-pointer"
                    onClick={() => handleFilterPillClick('property')}
                  >
                    {item}
                    <button
                      className="ml-1.5 text-green-500 hover:text-green-700 focus:outline-none"
                      onClick={(e) => handleRemovePropertyType(item, e)}
                      aria-label={`Remove ${item} property type`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start">
          <MapPinIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <span className="block text-neutral-600 dark:text-neutral-300 font-medium text-base">
              Distance Range:
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-50 cursor-pointer"
                onClick={() => handleFilterPillClick('distance')}
              >
                {distance} Kms
                <button
                  className="ml-1.5 text-blue-500 hover:text-blue-700 focus:outline-none"
                  onClick={(e) => handleRemoveDistance(e)}
                  aria-label="Remove distance filter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add handler for removing property types
  const handleRemovePropertyType = (propertyType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentTypes = searchParams.get('propertyTypes')?.split(',') || [];
    const updatedTypes = currentTypes.filter(type => type !== propertyType);
    
    const params = new URLSearchParams(searchParams.toString());
    if (updatedTypes.length > 0) {
      params.set('propertyTypes', updatedTypes.join(','));
    } else {
      params.delete('propertyTypes');
    }
    
    router.push(`/listing-stay-map?${params.toString()}` as any);
  };

  const [filtersVisible, setFiltersVisible] = useState(false);

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  return (
    <div className="SectionGridHasMap" id="restaurant-results">
      {/* API Endpoint Tester (Development Only) */}
      {process.env.NODE_ENV === 'development' && <ApiEndpointTester />}
      
      <div className="relative flex min-h-screen">
        {/* CARDSSSS */}
        <div className="min-h-screen w-full xl:w-[60%] 2xl:w-[60%] max-w-[1184px] flex-shrink-0 xl:px-8 ">
          {/* Location guidance message */}
          {locationError && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Location access needed for better results</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {locationError} Enable location services to see restaurants near you with accurate distances.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User location info */}
          {userLocation && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Your location: {userLocation.city ? `${userLocation.city}${userLocation.state ? ', ' + userLocation.state : ''}` : 'Current location'}
                    </p>
                    <p className="text-xs text-green-700">
                      Showing restaurants within {distance} kilometers
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-800">{filteredRestaurants.length}</p>
                  <p className="text-xs text-green-600">restaurants found</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <Heading2
              heading={
                <span className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                  {userLocation ? (
                    `Restaurants ${userLocation.city ? `in ${userLocation.city}` : 'near you'}`
                  ) : (
                    'Restaurants in Australia'
                  )}
                </span>
              }
              subHeading={filtersVisible ? getSearchContent() : null}
              className="!mb-8"
            />
            <button onClick={toggleFilters} className={`ml-4 text-blue-600 `}>
              {filtersVisible ? "" : "+ Show Filters"}
            </button>
          </div>
          {filtersVisible && (
            <div className="mb-8 lg:mb-11">
              <TabFilters page="stay" />
            </div>
          )}
          {loading ? (
            // Loading state
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 2xl:gap-x-6 gap-y-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-neutral-200 dark:bg-neutral-700 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-red-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" 
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Something went wrong
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  {error}. We're showing some sample restaurants instead.
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : DEMO_STAYS.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 2xl:gap-x-6 gap-y-8">
              {DEMO_STAYS.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setCurrentHoverID((_) => item.id)}
                  onMouseLeave={() => setCurrentHoverID((_) => -1)}
                  className="relative"
                >
                  <StayCard2 data={item} />
                  {/* Distance badge for location-filtered results */}
                  {item.distance !== undefined && userLocation && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                      {formatDistanceSimple(item.distance)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // No results found message
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-neutral-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  No restaurants found
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  {query ? (
                    <>We couldn't find any restaurants matching "<span className="font-medium text-neutral-900 dark:text-neutral-100">{query}</span>"{userLocation ? ` within ${distance}km of your location` : ''}. Try adjusting your search or filters.</>
                  ) : (
                    <>We couldn't find any restaurants matching your criteria{userLocation ? ` within ${distance}km of your location` : ''}. Try adjusting your search or filters.</>
                  )}
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Try:</p>
                  <ul className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
                    <li>• Searching for a different cuisine type (e.g., "Italian", "Chinese")</li>
                    <li>• Expanding your distance range to {distance.split('-')[1] === '50' ? '100km' : `${Math.min(parseInt(distance.split('-')[1]) * 2, 50)}km`}</li>
                    <li>• Removing some filters</li>
                    <li>• Checking your spelling</li>
                    {!userLocation && <li>• Enabling location services for more accurate results</li>}
                  </ul>
                </div>
                <button 
                  onClick={() => {
                    router.push(`/listing-stay-map` as any);
                  }}
                  className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
          <div className="flex mt-16 justify-center items-center">
            <Pagination />
          </div>
        </div>

        {!showFullMapFixed && (
          <div
            className={`flex xl:hidden items-center justify-center fixed bottom-16 md:bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-neutral-900 text-white shadow-2xl rounded-full z-30  space-x-3 text-sm cursor-pointer`}
            onClick={() => setShowFullMapFixed(true)}
          >
            <i className="text-lg las la-map"></i>
            <span>Show map</span>
          </div>
        )}

        {/* MAPPPPP */}
        <div
          className={`xl:flex-1 xl:static xl:block ${showFullMapFixed ? "fixed inset-0 z-50" : "hidden"
            }`}
        >
          {showFullMapFixed && (
            <ButtonClose
              onClick={() => setShowFullMapFixed(false)}
              className="bg-white absolute z-50 left-3 top-3 shadow-lg rounded-xl w-10 h-10"
            />
          )}

          <div className="fixed xl:sticky top-0 xl:top-[88px] left-0 w-full h-full xl:h-[calc(100vh-88px)] rounded-md overflow-hidden">
            <div className="absolute bottom-5 left-3 lg:bottom-auto lg:top-2.5 lg:left-1/2 transform lg:-translate-x-1/2 py-2 px-4 bg-white dark:bg-neutral-800 shadow-xl z-10 rounded-2xl min-w-max">
              <Checkbox
                className="text-xs xl:text-sm"
                name="xx"
                label="Search as I move the map"
              />
            </div>
            
            {/* Location-based Map with filtering */}
            <LocationBasedMap
              restaurants={restaurants}
              distanceRange={distance}
              onLocationUpdate={handleLocationUpdate}
              onFilteredRestaurants={handleFilteredRestaurants}
              currentHoverID={currentHoverID}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionGridHasMap;
