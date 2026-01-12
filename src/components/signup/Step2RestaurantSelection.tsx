"use client";

import React, { useState, useCallback, useEffect } from "react";
import { MapPinIcon, BuildingOfficeIcon, PhoneIcon, GlobeAltIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import Input from "@/shared/Input";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { debounce } from "lodash";

interface Restaurant {
  id: number;
  name: string;
  image?: string;
  image_thumbnail?: string;
  address: {
    street_address: string;
    room_number?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    full_address: string;
  };
  phone?: string;
  email?: string;
}

interface Step2RestaurantSelectionProps {
  formData: {
    restaurant_id: number | null;
    restaurant_name: string;
    restaurant_phone: string;
    restaurant_website: string;
    restaurant_email: string;
    restaurant_address: string;
    restaurant_unit_number: string;
    restaurant_street_number: string;
    restaurant_street_name: string;
    restaurant_suburb: string;
    restaurant_state: string;
    restaurant_postcode: string;
    restaurant_country: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Step2RestaurantSelection: React.FC<Step2RestaurantSelectionProps> = ({
  formData,
  handleChange,
  setFormData,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const [error, setError] = useState<string | null>(null);

  const getApiBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://restaurantreviews.io';
  };

  const getImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it starts with /, it's a relative path from the API base
    if (imagePath.startsWith('/')) {
      return `${getApiBaseUrl()}${imagePath}`;
    }
    
    // Otherwise, assume it's relative to the API base
    return `${getApiBaseUrl()}/${imagePath}`;
  };

  const searchRestaurants = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const baseUrl = getApiBaseUrl();
        console.log('🔍 Searching restaurants with query:', query);
        console.log('🌐 API Base URL:', baseUrl);
        
        // Try the dedicated registration search endpoint first
        let url = `${baseUrl}/api/restaurants/search-for-registration/?query=${encodeURIComponent(query)}&limit=10`;
        console.log('📡 Attempting URL:', url);
        
        let response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });

        console.log('📡 Response status:', response.status, response.statusText);

        // Fallback to regular search endpoint if dedicated endpoint doesn't exist
        if (!response.ok) {
          console.log('⚠️ Dedicated endpoint failed, trying regular search endpoint...');
          url = `${baseUrl}/api/restaurants/?search=${encodeURIComponent(query)}&limit=10&approved=true`;
          console.log('📡 Fallback URL:', url);
          
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            mode: 'cors'
          });
          
          console.log('📡 Fallback response status:', response.status, response.statusText);
        }

        if (response.ok) {
          const data = await response.json();
          console.log('✅ API Response received:', data);
          console.log('📊 Response structure:', {
            hasResults: !!data.results,
            resultsIsArray: Array.isArray(data.results),
            resultsLength: data.results?.length || 0,
            dataIsArray: Array.isArray(data),
            dataLength: Array.isArray(data) ? data.length : 'N/A'
          });
          
          // Handle both response formats
          let results = data.results || (Array.isArray(data) ? data : []);
          
          if (Array.isArray(results) && results.length > 0) {
            console.log('📋 Processing', results.length, 'restaurants');
            
            const formattedResults: Restaurant[] = results.map((r: any) => {
              // Build full address
              const streetAddress = r.street_address || r.address?.street_address || '';
              const city = r.city || r.address?.city || '';
              const state = r.state || r.address?.state || '';
              const postalCode = r.postal_code || r.address?.postal_code || '';
              const roomNumber = r.room_number || r.address?.room_number || '';
              
              let fullAddress = '';
              if (r.address?.full_address) {
                fullAddress = r.address.full_address;
              } else {
                const parts = [
                  roomNumber && `Unit ${roomNumber}`,
                  streetAddress,
                  city,
                  state,
                  postalCode
                ].filter(Boolean);
                fullAddress = parts.join(', ');
              }
              
              // Get image - try multiple sources
              const rawImage = r.image || r.image_thumbnail || r.logo || 
                           (r.images && r.images.length > 0 ? (typeof r.images[0] === 'string' ? r.images[0] : r.images[0].image || r.images[0]) : null);
              
              const image = rawImage ? getImageUrl(rawImage) : null;
              const imageThumbnail = r.image_thumbnail || r.logo || rawImage;
              
              console.log(`  - ${r.name}: image=${!!image}, address=${fullAddress}`);
              
              return {
                id: r.id,
                name: r.name,
                image: image,
                image_thumbnail: imageThumbnail ? getImageUrl(imageThumbnail) : image,
                address: {
                  street_address: streetAddress,
                  room_number: roomNumber || undefined,
                  city: city,
                  state: state,
                  postal_code: postalCode,
                  country: r.country || r.address?.country || 'Australia',
                  full_address: fullAddress || 'Address not available',
                },
                phone: r.phone,
                email: r.email,
              };
            });
            
            console.log('✅ Formatted results:', formattedResults.length);
            setSearchResults(formattedResults);
          } else {
            console.log('⚠️ No results found or invalid response format');
            setSearchResults([]);
            setError('No restaurants found. Try a different search term.');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ API Error:', response.status, errorText);
          setError(`Search failed: ${response.status} ${response.statusText}`);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('❌ Search error:', error);
        setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery) {
      searchRestaurants(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchRestaurants]);

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setFormData((prev: any) => ({
      ...prev,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      restaurant_phone: restaurant.phone || '',
      restaurant_email: restaurant.email || '',
      restaurant_address: restaurant.address.full_address,
    }));
    setShowAddForm(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleAddNewClick = () => {
    setShowAddForm(true);
    setSelectedRestaurant(null);
    setFormData((prev: any) => ({
      ...prev,
      restaurant_id: null,
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Select or Add Restaurant
      </h2>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

      {/* Restaurant Search */}
      <div className="space-y-4">
        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200">
            Search for Restaurant
          </span>
          <div className="mt-1 relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address or enter manually"
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                ×
              </button>
            )}
          </div>
        </label>

        {/* Search Results */}
        {loading && (
          <div className="text-center py-4 text-neutral-500">Searching...</div>
        )}

        {error && !loading && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {!loading && !error && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div className="text-center py-4 text-neutral-500 text-sm">
            No restaurants found. Try a different search term or add a new restaurant.
          </div>
        )}

        {!loading && !error && searchResults.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => handleRestaurantSelect(restaurant)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRestaurant?.id === restaurant.id
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  {(restaurant.image_thumbnail || restaurant.image) ? (
                    <img
                      src={restaurant.image_thumbnail || restaurant.image}
                      alt={restaurant.name}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                      onError={(e) => {
                        // Hide image if it fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                      <BuildingOfficeIcon className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {restaurant.address.full_address}
                    </p>
                    {restaurant.phone && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                        📞 {restaurant.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Restaurant Display */}
        {selectedRestaurant && !showAddForm && (
          <div className="p-4 border-2 border-primary-500 rounded-lg bg-primary-50 dark:bg-primary-900/20">
            <div className="flex items-start gap-3">
              {(selectedRestaurant.image_thumbnail || selectedRestaurant.image) ? (
                <img
                  src={selectedRestaurant.image_thumbnail || selectedRestaurant.image}
                  alt={selectedRestaurant.name}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                  <BuildingOfficeIcon className="w-6 h-6 text-neutral-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedRestaurant.name}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {selectedRestaurant.address.full_address}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedRestaurant(null);
                  setFormData((prev: any) => ({
                    ...prev,
                    restaurant_id: null,
                  }));
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Add New Restaurant Button */}
        <div className="text-center">
          <button
            onClick={handleAddNewClick}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            + Add New Restaurant
          </button>
        </div>
      </div>

      {/* Add New Restaurant Form */}
      {showAddForm && (
        <div className="space-y-6 mt-6 p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Venue Name
          </h3>

          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <BuildingOfficeIcon className="w-4 h-4" />
              Venue Name:
            </span>
            <Input
              type="text"
              name="restaurant_name"
              value={formData.restaurant_name}
              onChange={handleChange}
              placeholder="Enter venue name"
              className="mt-1 pl-10"
            />
          </label>

          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              Venue Phone (Mobile or landline):
            </span>
            <Input
              type="tel"
              name="restaurant_phone"
              value={formData.restaurant_phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="mt-1 pl-10"
            />
          </label>

          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4" />
              Venue Website (Optional):
            </span>
            <Input
              type="url"
              name="restaurant_website"
              value={formData.restaurant_website}
              onChange={handleChange}
              placeholder="https://www.example.com"
              className="mt-1 pl-10"
            />
          </label>

          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4" />
              Venue Email (Optional):
            </span>
            <Input
              type="email"
              name="restaurant_email"
              value={formData.restaurant_email}
              onChange={handleChange}
              placeholder="restaurant@example.com"
              className="mt-1 pl-10"
            />
          </label>

          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-8">
            Venue Address
          </h3>

          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <MapPinIcon className="w-4 h-4" />
              Venue Address:
            </span>
            <Input
              type="text"
              name="restaurant_address"
              value={formData.restaurant_address}
              onChange={handleChange}
              placeholder="Search address or enter manually"
              className="mt-1 pl-10"
            />
          </label>

          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="useCurrentLocation"
              className="w-4 h-4"
            />
            <label htmlFor="useCurrentLocation" className="text-neutral-800 dark:text-neutral-200">
              Use Current Location
            </label>
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            If the address can't be found, enter it manually.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Unit Number (Optional)
              </span>
              <Input
                type="text"
                name="restaurant_unit_number"
                value={formData.restaurant_unit_number}
                onChange={handleChange}
                placeholder="Unit 1"
                className="mt-1"
              />
            </label>

            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Street Number
              </span>
              <Input
                type="text"
                name="restaurant_street_number"
                value={formData.restaurant_street_number}
                onChange={handleChange}
                placeholder="123"
                className="mt-1"
              />
            </label>

            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Street Name
              </span>
              <Input
                type="text"
                name="restaurant_street_name"
                value={formData.restaurant_street_name}
                onChange={handleChange}
                placeholder="Main St"
                className="mt-1"
              />
            </label>

            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Suburb
              </span>
              <Input
                type="text"
                name="restaurant_suburb"
                value={formData.restaurant_suburb}
                onChange={handleChange}
                placeholder="Robina"
                className="mt-1"
              />
            </label>

            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                State
              </span>
              <Input
                type="text"
                name="restaurant_state"
                value={formData.restaurant_state}
                onChange={handleChange}
                placeholder="QLD"
                className="mt-1"
              />
            </label>

            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Postcode
              </span>
              <Input
                type="text"
                name="restaurant_postcode"
                value={formData.restaurant_postcode}
                onChange={handleChange}
                placeholder="4227"
                className="mt-1"
              />
            </label>

            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Country
              </span>
              <Input
                type="text"
                name="restaurant_country"
                value={formData.restaurant_country}
                onChange={handleChange}
                placeholder="Australia"
                className="mt-1"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2RestaurantSelection;

