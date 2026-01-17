"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
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
  coordinates?: {
    latitude: number | string;
    longitude: number | string;
  };
  phone?: string;
  email?: string;
  owner?: number | null;
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
    restaurant_latitude?: number | string;
    restaurant_longitude?: number | string;
    ownership_proof: File | null;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors?: { [field: string]: string };
}

const Step2RestaurantSelection: React.FC<Step2RestaurantSelectionProps> = ({
  formData,
  handleChange,
  handleFileChange,
  setFormData,
  errors = {},
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState("");
  const [filterState, setFilterState] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchCache = useRef<Map<string, Restaurant[]>>(new Map());
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const getApiBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://restaurantreviews.io';
  };

  const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
    if (!imagePath) return undefined;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `${getApiBaseUrl()}${imagePath}`;
    }
    
    return `${getApiBaseUrl()}/${imagePath}`;
  };

  const searchRestaurants = useCallback(
    debounce(async (query: string, city?: string, state?: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setError(null);
        return;
      }

      // Check cache first
      const cacheKey = `${query.toLowerCase().trim()}_${city || ''}_${state || ''}`;
      if (searchCache.current.has(cacheKey)) {
        const cachedResults = searchCache.current.get(cacheKey)!;
        setSearchResults(cachedResults);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const baseUrl = getApiBaseUrl();
        console.log('🔍 Searching restaurants with query:', query);
        
        // Build URL with filters
        const params = new URLSearchParams({
          query: query,
          limit: '10',
        });
        
        if (city) params.set('city', city);
        if (state) params.set('state', state);
        
        // Try the dedicated registration search endpoint first
        let url = `${baseUrl}/api/restaurants/search-for-registration/?${params.toString()}`;
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
          const fallbackParams = new URLSearchParams({
            search: query,
            limit: '10',
            approved: 'true',
            is_original: 'true', // Add is_original filter
          });
          
          if (city) fallbackParams.set('city', city);
          if (state) fallbackParams.set('state', state);
          
          url = `${baseUrl}/api/restaurants/?${fallbackParams.toString()}`;
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
          
          let results = data.results || (Array.isArray(data) ? data : []);
          
          if (Array.isArray(results) && results.length > 0) {
            console.log('📋 Processing', results.length, 'restaurants');
            
            const formattedResults: Restaurant[] = results.map((r: any) => {
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
              
              const rawImage = r.image || r.image_thumbnail || r.logo || 
                           (r.images && r.images.length > 0 ? (typeof r.images[0] === 'string' ? r.images[0] : r.images[0].image || r.images[0]) : null);
              
              const image = (rawImage && typeof rawImage === 'string') ? getImageUrl(rawImage) : undefined;
              const imageThumbnailRaw = r.image_thumbnail || r.logo || rawImage;
              
              // Handle coordinates
              const coordinates = r.coordinates ? {
                latitude: r.coordinates.latitude || r.latitude,
                longitude: r.coordinates.longitude || r.longitude,
              } : (r.latitude && r.longitude ? {
                latitude: r.latitude,
                longitude: r.longitude,
              } : undefined);
              
              return {
                id: r.id,
                name: r.name,
                image: image,
                image_thumbnail: (imageThumbnailRaw && typeof imageThumbnailRaw === 'string') ? getImageUrl(imageThumbnailRaw) : image,
                address: {
                  street_address: streetAddress,
                  room_number: roomNumber || undefined,
                  city: city,
                  state: state,
                  postal_code: postalCode,
                  country: r.country || r.address?.country || 'Australia',
                  full_address: fullAddress || 'Address not available',
                },
                coordinates: coordinates,
                phone: r.phone,
                email: r.email,
                owner: r.owner || null,
              };
            });
            
            // Cache results
            searchCache.current.set(cacheKey, formattedResults);
            if (searchCache.current.size > 50) {
              const firstKey = searchCache.current.keys().next().value;
              if (firstKey) {
                searchCache.current.delete(firstKey);
              }
            }
            
            console.log('✅ Formatted results:', formattedResults.length);
            setSearchResults(formattedResults);
          } else {
            console.log('⚠️ No results found or invalid response format');
            setSearchResults([]);
            setError(null);
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

  // Restore UI state when component mounts or formData changes
  useEffect(() => {
    // If a restaurant was previously selected (restaurant_id exists)
    if (formData.restaurant_id && !selectedRestaurant) {
      // Create a restaurant object from formData to restore the UI state
      const restoredRestaurant: Restaurant = {
        id: formData.restaurant_id,
        name: formData.restaurant_name || 'Selected Restaurant',
        address: {
          street_address: formData.restaurant_street_name || '',
          city: formData.restaurant_suburb || '',
          state: formData.restaurant_state || '',
          postal_code: formData.restaurant_postcode || '',
          country: formData.restaurant_country || 'Australia',
          full_address: formData.restaurant_address || '',
        },
        phone: formData.restaurant_phone || undefined,
        email: formData.restaurant_email || undefined,
        coordinates: formData.restaurant_latitude && formData.restaurant_longitude ? {
          latitude: formData.restaurant_latitude,
          longitude: formData.restaurant_longitude,
        } : undefined,
      };
      setSelectedRestaurant(restoredRestaurant);
      setShowAddForm(false);
    }
    // If restaurant_name exists but no restaurant_id, they were adding a new restaurant
    else if (formData.restaurant_name && !formData.restaurant_id && !showAddForm) {
      setShowAddForm(true);
      setSelectedRestaurant(null);
    }
    // If neither restaurant_id nor restaurant_name, reset to search state
    else if (!formData.restaurant_id && !formData.restaurant_name && (selectedRestaurant || showAddForm)) {
      setSelectedRestaurant(null);
      setShowAddForm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.restaurant_id, formData.restaurant_name]);

  useEffect(() => {
    if (searchQuery) {
      searchRestaurants(searchQuery, filterCity, filterState);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, filterCity, filterState, searchRestaurants]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!searchResults.length || !inputRef.current) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleRestaurantSelect(searchResults[selectedIndex]);
      } else if (e.key === 'Escape') {
        setSearchQuery("");
        setSearchResults([]);
        setSelectedIndex(-1);
      }
    };

    if (searchResults.length > 0) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [searchResults, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleRestaurantSelect = async (restaurant: Restaurant) => {
    setError(null);
    
    // The search endpoint already filters restaurants with is_original=true,
    // which should return only claimable restaurants (including those owned by "Website Admin").
    // The backend registration endpoint will handle final validation.
    // So we can proceed directly with selection.
    
    setSelectedRestaurant(restaurant);
    setFormData((prev: any) => ({
      ...prev,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      restaurant_phone: restaurant.phone || '',
      restaurant_email: restaurant.email || '',
      restaurant_address: restaurant.address.full_address,
      restaurant_latitude: restaurant.coordinates?.latitude,
      restaurant_longitude: restaurant.coordinates?.longitude,
    }));
    setShowAddForm(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedIndex(-1);
  };

  const handleAddNewClick = () => {
    setShowAddForm(true);
    setSelectedRestaurant(null);
    setFormData((prev: any) => ({
      ...prev,
      restaurant_id: null,
    }));
  };

  // Validation functions
  const validateVenueName = (name: string): string => {
    if (!name || !name.trim()) {
      return 'Venue name is required';
    }
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone || !phone.trim()) {
      return 'Phone number is required';
    }
    // Basic phone validation - accepts international formats
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return '';
  };

  const validateWebsite = (website: string): string => {
    if (!website || !website.trim()) {
      return ''; // Optional field
    }
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;
    if (!urlRegex.test(website)) {
      return 'Please enter a valid website URL';
    }
    if (website === 'www.' || website === 'http://' || website === 'https://') {
      return 'Please enter a valid website URL';
    }
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email || !email.trim()) {
      return ''; // Optional field
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateStreetNumber = (streetNumber: string): string => {
    if (!streetNumber || !streetNumber.trim()) {
      return 'Street number is required';
    }
    return '';
  };

  const validateStreetName = (streetName: string): string => {
    if (!streetName || !streetName.trim()) {
      return 'Street name is required';
    }
    return '';
  };

  const validateSuburb = (suburb: string): string => {
    if (!suburb || !suburb.trim()) {
      return 'Suburb is required';
    }
    return '';
  };

  const validateState = (state: string): string => {
    if (!state || !state.trim()) {
      return 'State is required';
    }
    return '';
  };

  const validatePostcode = (postcode: string): string => {
    if (!postcode || !postcode.trim()) {
      return 'Postcode is required';
    }
    const postcodeRegex = /^\d{4}$/;
    if (!postcodeRegex.test(postcode)) {
      return 'Please enter a valid 4-digit postcode';
    }
    return '';
  };

  // Auto-capitalize text fields
  const capitalizeWords = (str: string): string => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-capitalize text fields (except email, website, phone, postcode)
    let processedValue = value;
    if (['restaurant_name', 'restaurant_unit_number', 'restaurant_street_name', 'restaurant_suburb', 'restaurant_state', 'restaurant_country'].includes(name)) {
      // Capitalize first letter of each word
      processedValue = capitalizeWords(value);
    }
    
    // Update form data
    handleChange({
      ...e,
      target: { ...e.target, value: processedValue, name }
    } as React.ChangeEvent<HTMLInputElement>);
    
    // Real-time validation
    let error = '';
    switch (name) {
      case 'restaurant_name':
        error = validateVenueName(processedValue);
        break;
      case 'restaurant_phone':
        error = validatePhone(processedValue);
        break;
      case 'restaurant_website':
        error = validateWebsite(processedValue);
        break;
      case 'restaurant_email':
        error = validateEmail(processedValue);
        break;
      case 'restaurant_street_number':
        error = validateStreetNumber(processedValue);
        break;
      case 'restaurant_street_name':
        error = validateStreetName(processedValue);
        break;
      case 'restaurant_suburb':
        error = validateSuburb(processedValue);
        break;
      case 'restaurant_state':
        error = validateState(processedValue);
        break;
      case 'restaurant_postcode':
        error = validatePostcode(processedValue);
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingLocation(true);
    setError(null);
    setUseCurrentLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use Google Geocoding API to reverse geocode
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          if (apiKey) {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=en`
            );
            const data = await response.json();
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              const result = data.results[0];
              const components = result.address_components || [];
              
              let unitNumber = '';
              let streetNumber = '';
              let streetName = '';
              let suburb = '';
              let state = '';
              let postcode = '';
              let country = 'Australia';
              
              components.forEach((component: any) => {
                const types = component.types;
                if (types.includes('subpremise')) {
                  unitNumber = component.long_name;
                } else if (types.includes('street_number')) {
                  streetNumber = component.long_name;
                } else if (types.includes('route')) {
                  streetName = component.long_name;
                } else if (types.includes('locality') || types.includes('sublocality')) {
                  suburb = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                  state = component.short_name;
                } else if (types.includes('postal_code')) {
                  postcode = component.long_name;
                } else if (types.includes('country')) {
                  country = component.long_name;
                }
              });
              
              setFormData((prev: any) => ({
                ...prev,
                restaurant_address: result.formatted_address,
                restaurant_unit_number: unitNumber,
                restaurant_street_number: streetNumber,
                restaurant_street_name: streetName,
                restaurant_suburb: suburb,
                restaurant_state: state,
                restaurant_postcode: postcode,
                restaurant_country: country || 'Australia',
                restaurant_latitude: latitude,
                restaurant_longitude: longitude,
              }));
            }
          } else {
            // Fallback: just set coordinates
            setFormData((prev: any) => ({
              ...prev,
              restaurant_latitude: latitude,
              restaurant_longitude: longitude,
            }));
          }
        } catch (err) {
          console.error('Geocoding error:', err);
          // Still set coordinates even if geocoding fails
          setFormData((prev: any) => ({
            ...prev,
            restaurant_latitude: latitude,
            restaurant_longitude: longitude,
          }));
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to get your location. Please enter address manually.');
        setIsLoadingLocation(false);
        setUseCurrentLocation(false);
      }
    );
  };

  // Get validation state for a field
  const getFieldValidationState = (name: string, value: string): 'valid' | 'invalid' | 'neutral' => {
    if (fieldErrors[name]) return 'invalid';
    if (!value || !value.trim()) return 'neutral';
    
    // Check if field is valid based on its validation
    switch (name) {
      case 'restaurant_name':
        return validateVenueName(value) ? 'invalid' : 'valid';
      case 'restaurant_phone':
        return validatePhone(value) ? 'invalid' : 'valid';
      case 'restaurant_website':
        return value && validateWebsite(value) ? 'invalid' : (value ? 'valid' : 'neutral');
      case 'restaurant_email':
        return value && validateEmail(value) ? 'invalid' : (value ? 'valid' : 'neutral');
      case 'restaurant_street_number':
        return validateStreetNumber(value) ? 'invalid' : 'valid';
      case 'restaurant_street_name':
        return validateStreetName(value) ? 'invalid' : 'valid';
      case 'restaurant_suburb':
        return validateSuburb(value) ? 'invalid' : 'valid';
      case 'restaurant_state':
        return validateState(value) ? 'invalid' : 'valid';
      case 'restaurant_postcode':
        return validatePostcode(value) ? 'invalid' : 'valid';
      default:
        return 'neutral';
    }
  };

  const getBorderClass = (name: string, value: string): string => {
    const state = getFieldValidationState(name, value);
    if (state === 'valid') {
      return 'border-green-500 focus:border-green-500 focus:ring-green-500/20';
    } else if (state === 'invalid') {
      return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
    }
    return 'border-gray-300';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Select or Add Restaurant
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Find your restaurant or add a new one
        </p>
      </div>

      {/* Restaurant Search */}
      <div className="space-y-4">
        {errors.restaurant_selection && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{errors.restaurant_selection}</p>
          </div>
        )}
        
        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200">
            Search for Restaurant
          </span>
          <div className="mt-1 relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              placeholder="Search address or enter manually"
              className="pl-10 pr-10"
              onFocus={() => setSelectedIndex(-1)}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setSelectedIndex(-1);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                ×
              </button>
            )}
          </div>
        </label>

        {/* City/State Filters */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 text-sm">
              Filter by City (Optional)
            </span>
            <Input
              type="text"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              placeholder="City name"
              className="mt-1"
            />
          </label>
          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 text-sm">
              Filter by State (Optional)
            </span>
            <Input
              type="text"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              placeholder="State/Province"
              className="mt-1"
            />
          </label>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {!loading && !error && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div className="text-center py-6 space-y-2">
            <p className="text-neutral-500 text-sm">
              No restaurants found matching "{searchQuery}"
            </p>
            <div className="text-xs text-neutral-400 space-y-1">
              <p>💡 Try:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Checking your spelling</li>
                <li>Using fewer words</li>
                <li>Searching by city or state</li>
                <li>Adding a new restaurant instead</li>
              </ul>
            </div>
          </div>
        )}

        {!loading && !error && searchResults.length > 0 && (
          <div ref={resultsRef} className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((restaurant, index) => (
              <div
                key={restaurant.id}
                onClick={() => handleRestaurantSelect(restaurant)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedIndex === index
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-300"
                    : selectedRestaurant?.id === restaurant.id
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
                    restaurant_latitude: undefined,
                    restaurant_longitude: undefined,
                  }));
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ownership Proof Field - Always visible */}
      <div className="mt-6 p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
            Ownership Proof <span className="text-red-500">*</span>
          </span>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
            Upload ASIC extract
          </p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="block w-full text-sm text-neutral-600 dark:text-neutral-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100
              dark:file:bg-primary-900/30 dark:file:text-primary-300
              dark:hover:file:bg-primary-900/50
              cursor-pointer
              border border-neutral-300 dark:border-neutral-600 rounded-lg p-2
              bg-white dark:bg-neutral-900"
          />
          {formData.ownership_proof && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              ✓ {formData.ownership_proof.name}
            </p>
          )}
          {errors.ownership_proof && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ownership_proof}</p>
          )}
        </label>
      </div>

      {/* Or Divider */}
      {!showAddForm && (
        <div className="relative text-center my-6">
          <span className="relative z-10 inline-block px-4 font-medium text-sm text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800">
            OR
          </span>
          <div className="absolute left-0 w-full top-1/2 transform -translate-y-1/2 border-t border-neutral-200 dark:border-neutral-700"></div>
        </div>
      )}

      {/* Add New Restaurant Button - Hidden when form is open */}
      {!showAddForm && (
        <div className="text-center">
          <button
            onClick={handleAddNewClick}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            + Add New Restaurant
          </button>
        </div>
      )}

      {/* Add New Restaurant Form */}
      {showAddForm && (
        <div className="space-y-6 mt-6 p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Venue Name
          </h3>

          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
              Venue Name <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              <Input
                type="text"
                name="restaurant_name"
                value={formData.restaurant_name}
                onChange={handleFieldChange}
                placeholder="Moo Moo Restaurant"
                className={`mt-0 pl-10 ${getBorderClass('restaurant_name', formData.restaurant_name)}`}
              />
            </div>
            {fieldErrors.restaurant_name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.restaurant_name}</p>
            )}
          </label>

          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
              Venue Phone <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              <Input
                type="tel"
                name="restaurant_phone"
                value={formData.restaurant_phone}
                onChange={handleFieldChange}
                placeholder="411 222 333 or 7 1234 5678"
                className={`mt-0 pl-10 ${getBorderClass('restaurant_phone', formData.restaurant_phone)}`}
              />
            </div>
            {fieldErrors.restaurant_phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.restaurant_phone}</p>
            )}
            {!fieldErrors.restaurant_phone && formData.restaurant_phone.trim() && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Mobile or landline accepted (leading 0 is optional)
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
              Venue Website <span className="text-neutral-500 text-xs font-normal">(Optional)</span>
            </span>
            <div className="relative">
              <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              <Input
                type="url"
                name="restaurant_website"
                value={formData.restaurant_website}
                onChange={handleFieldChange}
                placeholder="https://www.moomoo.com.au"
                className={`mt-0 pl-10 ${getBorderClass('restaurant_website', formData.restaurant_website)}`}
              />
            </div>
            {fieldErrors.restaurant_website && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.restaurant_website}</p>
            )}
          </label>

          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
              Venue Email <span className="text-neutral-500 text-xs font-normal">(Optional)</span>
            </span>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              <Input
                type="email"
                name="restaurant_email"
                value={formData.restaurant_email}
                onChange={handleFieldChange}
                placeholder="restaurant@example.com"
                className={`mt-0 pl-10 ${getBorderClass('restaurant_email', formData.restaurant_email)}`}
              />
            </div>
            {fieldErrors.restaurant_email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.restaurant_email}</p>
            )}
          </label>

          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-8">
            Venue Address
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Fields */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
                  Address Search
                </span>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                  <Input
                    type="text"
                    name="restaurant_address"
                    value={formData.restaurant_address}
                    onChange={handleFieldChange}
                    placeholder="Search address or enter manually"
                    className="mt-0 pl-10"
                  />
                  {formData.restaurant_address && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev: any) => ({
                          ...prev,
                          restaurant_address: '',
                          restaurant_unit_number: '',
                          restaurant_street_number: '',
                          restaurant_street_name: '',
                          restaurant_suburb: '',
                          restaurant_state: '',
                          restaurant_postcode: '',
                        }));
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                      ×
                    </button>
                  )}
                </div>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="useCurrentLocation"
                  checked={useCurrentLocation}
                  onChange={handleUseCurrentLocation}
                  className="w-4 h-4"
                />
                <label htmlFor="useCurrentLocation" className="text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                  {isLoadingLocation && (
                    <svg className="animate-spin h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Use Current Location
                </label>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                If the address can't be found, enter it manually.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
                    Unit Number <span className="text-neutral-500 text-xs font-normal">(Optional)</span>
                  </span>
                  <Input
                    type="text"
                    name="restaurant_unit_number"
                    value={formData.restaurant_unit_number}
                    onChange={handleFieldChange}
                    placeholder="Unit 1"
                    className="mt-0"
                  />
                </label>

                <label className="block">
                  <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
                    Street Number <span className="text-red-500">*</span>
                  </span>
                  <Input
                    type="text"
                    name="restaurant_street_number"
                    value={formData.restaurant_street_number}
                    onChange={handleFieldChange}
                    placeholder="123"
                    className={`mt-0 ${getBorderClass('restaurant_street_number', formData.restaurant_street_number)}`}
                  />
                  {fieldErrors.restaurant_street_number && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.restaurant_street_number}</p>
                  )}
                </label>

                <label className="block">
                  <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
                    Street Name <span className="text-red-500">*</span>
                  </span>
                  <Input
                    type="text"
                    name="restaurant_street_name"
                    value={formData.restaurant_street_name}
                    onChange={handleFieldChange}
                    placeholder="Main St"
                    className={`mt-0 ${getBorderClass('restaurant_street_name', formData.restaurant_street_name)}`}
                  />
                  {fieldErrors.restaurant_street_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.restaurant_street_name}</p>
                  )}
                </label>

                <label className="block">
                  <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
                    Suburb <span className="text-red-500">*</span>
                  </span>
                  <Input
                    type="text"
                    name="restaurant_suburb"
                    value={formData.restaurant_suburb}
                    onChange={handleFieldChange}
                    placeholder="Robina"
                    className={`mt-0 ${getBorderClass('restaurant_suburb', formData.restaurant_suburb)}`}
                  />
                  {fieldErrors.restaurant_suburb && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.restaurant_suburb}</p>
                  )}
                </label>

                <label className="block">
                  <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
                    State <span className="text-red-500">*</span>
                  </span>
                  <Input
                    type="text"
                    name="restaurant_state"
                    value={formData.restaurant_state}
                    onChange={handleFieldChange}
                    placeholder="QLD"
                    className={`mt-0 ${getBorderClass('restaurant_state', formData.restaurant_state)}`}
                  />
                  {fieldErrors.restaurant_state && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.restaurant_state}</p>
                  )}
                </label>

                <label className="block">
                  <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
                    Postcode <span className="text-red-500">*</span>
                  </span>
                  <Input
                    type="text"
                    name="restaurant_postcode"
                    value={formData.restaurant_postcode}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      handleFieldChange({
                        ...e,
                        target: { ...e.target, value, name: e.target.name }
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    placeholder="4227"
                    className={`mt-0 ${getBorderClass('restaurant_postcode', formData.restaurant_postcode)}`}
                    maxLength={4}
                  />
                  {fieldErrors.restaurant_postcode && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.restaurant_postcode}</p>
                  )}
                </label>

                <label className="block">
                  <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
                    Country <span className="text-neutral-500 text-xs font-normal">(Optional)</span>
                  </span>
                  <Input
                    type="text"
                    name="restaurant_country"
                    value={formData.restaurant_country || 'Australia'}
                    onChange={handleFieldChange}
                    placeholder="Australia"
                    className={`mt-0 ${errors.restaurant_country ? 'border-red-500' : ''}`}
                  />
                  {errors.restaurant_country && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.restaurant_country}</p>
                  )}
                </label>
              </div>
            </div>

            {/* Map Display */}
            <div className="hidden lg:block">
              <div className="sticky top-4">
                <label className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-2 block">
                  Map Preview
                </label>
                <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700" style={{ minHeight: '420px' }}>
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ minHeight: '420px', border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      formData.restaurant_address || 
                      `${formData.restaurant_street_number} ${formData.restaurant_street_name}, ${formData.restaurant_suburb}, ${formData.restaurant_state}, ${formData.restaurant_postcode}` ||
                      'Queensland, Australia'
                    )}&output=embed`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Close Form Button */}
          <div className="flex justify-center pt-4 border-t border-neutral-200 dark:border-neutral-700 mt-6">
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData((prev: any) => ({
                  ...prev,
                  restaurant_name: "",
                  restaurant_phone: "",
                  restaurant_website: "",
                  restaurant_email: "",
                  restaurant_address: "",
                  restaurant_unit_number: "",
                  restaurant_street_number: "",
                  restaurant_street_name: "",
                  restaurant_suburb: "",
                  restaurant_state: "",
                  restaurant_postcode: "",
                }));
              }}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2RestaurantSelection;
