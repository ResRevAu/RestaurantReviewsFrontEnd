"use client";

import React, { FC, Fragment, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Checkbox from '@/shared/Checkbox';
import { StarIcon, ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// --- API Response Interfaces ---
interface ApiRestaurantSuggestion {
  id: number;
  name: string;
}

interface ApiVenueTypeSuggestion {
  id: number;
  name: string;
  code: string;
}

interface ApiCuisineTypeSuggestion {
  id: number;
  name: string;
  code: string;
}

interface ApiAmenitySuggestion {
  id: number;
  name: string;
  code: string;
  category__name: string;
}

interface ApiMenuItemSuggestion {
  id: number;
  name: string;
  description?: string;
  restaurant__name: string;
  restaurant__id: number;
  menu_design_category__category__name: string;
  menu_design_category__category__code: string;
}

interface ApiResponse {
  query: string;
  suggestions: {
    restaurants: ApiRestaurantSuggestion[];
    venue_types: ApiVenueTypeSuggestion[];
    cuisine_types: ApiCuisineTypeSuggestion[];
    amenities: ApiAmenitySuggestion[];
    menu_items: ApiMenuItemSuggestion[];
  };
  total_results: number;
}

// --- Local Interfaces for Suggestion Types ---
interface BaseSuggestion {
  id: string | number;
  type: 'restaurant' | 'menu_item' | 'recent' | 'venue_type' | 'cuisine_type' | 'amenity' | 'near_me';
}

interface RestaurantSuggestion extends BaseSuggestion {
  type: 'restaurant';
  name: string;
  id: number;
}

interface MenuItemSuggestion extends BaseSuggestion {
  type: 'menu_item';
  name: string;
  description?: string;
  restaurant_name: string;
  restaurant_id: number;
  category_name: string;
}

interface VenueTypeSuggestion extends BaseSuggestion {
  type: 'venue_type';
  name: string;
  code: string;
}

interface CuisineTypeSuggestion extends BaseSuggestion {
  type: 'cuisine_type';
  name: string;
  code: string;
}

interface AmenitySuggestion extends BaseSuggestion {
  type: 'amenity';
  name: string;
  code: string;
  category_name: string;
}

interface RecentSuggestion extends BaseSuggestion {
  type: 'recent';
  text: string;
  timestamp: number;
}

interface NearMeSuggestion extends BaseSuggestion {
  type: 'near_me';
  text: string;
  description: string;
}

export type Suggestion = RestaurantSuggestion | MenuItemSuggestion | VenueTypeSuggestion | CuisineTypeSuggestion | AmenitySuggestion | RecentSuggestion | NearMeSuggestion;

// --- Recent Searches Helper Functions ---
const RECENT_SEARCHES_KEY = 'restaurant_recent_searches';

const getRecentSearches = (): RecentSuggestion[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((item: any, index: number) => ({
      id: `recent-${index}`,
      type: 'recent' as const,
      text: item.text,
      timestamp: item.timestamp
    }));
  } catch (e) {
    return [];
  }
};

const addRecentSearch = (text: string) => {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSearches().map(r => ({ text: r.text, timestamp: r.timestamp }));
    const filtered = recent.filter(r => r.text.toLowerCase() !== text.toLowerCase());
    const updated = [{ text, timestamp: Date.now() }, ...filtered].slice(0, 5);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save recent search:', e);
  }
};

// --- API Helper Functions ---
const getApiBaseUrl = () => {
  // Using restaurantreviews.io as primary API base URL
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://restaurantreviews.io';
};

const fetchAutocompleteData = async (query: string): Promise<ApiResponse | null> => {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/restaurants/autocomplete/?query=${encodeURIComponent(query)}&limit=5`;
    
    console.log('Fetching autocomplete data from:', url); // Debug log
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors' // Enable CORS
    });
    
    if (!response.ok) {
      console.warn('Autocomplete API error:', response.status, response.statusText);
      // Try alternative endpoints if primary fails
      return await tryAlternativeEndpoints(query);
    }
    
    const data = await response.json();
    console.log('Autocomplete API response:', data); // Debug log
    
    return data;
  } catch (error) {
    console.error('Autocomplete API fetch error:', error);
    // Try alternative endpoints on error
    return await tryAlternativeEndpoints(query);
  }
};

const tryAlternativeEndpoints = async (query: string): Promise<ApiResponse | null> => {
  const alternativeUrls = [
    'https://restaurantreviews.io/api/restaurants/autocomplete/', // Primary
    '/api/proxy/autocomplete/', // Local proxy endpoint
    'http://35.92.149.12/api/restaurants/autocomplete/', // Backup IP
    'http://localhost:8000/api/restaurants/autocomplete/' // Development
  ];

  for (const baseUrl of alternativeUrls) {
    try {
      let url: string;
      if (baseUrl.startsWith('/')) {
        // Local proxy endpoint
        url = `${baseUrl}?query=${encodeURIComponent(query)}&limit=5`;
      } else {
        // External API endpoint  
        url = `${baseUrl}?query=${encodeURIComponent(query)}&limit=5`;
      }
      console.log('Trying alternative endpoint:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Success with alternative endpoint:', baseUrl, data);
        return data;
      }
    } catch (error) {
      console.log('Alternative endpoint failed:', baseUrl, error);
      continue;
    }
  }
  
  console.log('All API endpoints failed, using mock data');
  return null;
};

const convertApiDataToSuggestions = (apiData: ApiResponse): Suggestion[] => {
  const suggestions: Suggestion[] = [];

  console.log('Converting API data:', apiData); // Debug log

  // Convert restaurants
  if (apiData.suggestions?.restaurants) {
    apiData.suggestions.restaurants.forEach(restaurant => {
      suggestions.push({
        id: restaurant.id,
        type: 'restaurant',
        name: restaurant.name
      });
    });
    console.log('Added restaurants:', apiData.suggestions.restaurants.length); // Debug log
  }

  // Convert venue types
  if (apiData.suggestions?.venue_types) {
    apiData.suggestions.venue_types.forEach(venueType => {
      suggestions.push({
        id: `venue-${venueType.id}`,
        type: 'venue_type',
        name: venueType.name,
        code: venueType.code
      });
    });
    console.log('Added venue types:', apiData.suggestions.venue_types.length); // Debug log
  }

  // Convert cuisine types
  if (apiData.suggestions?.cuisine_types) {
    apiData.suggestions.cuisine_types.forEach(cuisineType => {
      suggestions.push({
        id: `cuisine-${cuisineType.id}`,
        type: 'cuisine_type',
        name: cuisineType.name,
        code: cuisineType.code
      });
    });
    console.log('Added cuisine types:', apiData.suggestions.cuisine_types.length); // Debug log
  }

  // Convert amenities
  if (apiData.suggestions?.amenities) {
    apiData.suggestions.amenities.forEach(amenity => {
      suggestions.push({
        id: `amenity-${amenity.id}`,
        type: 'amenity',
        name: amenity.name,
        code: amenity.code,
        category_name: amenity.category__name
      });
    });
    console.log('Added amenities:', apiData.suggestions.amenities.length); // Debug log
  }

  // Convert menu items
  if (apiData.suggestions?.menu_items) {
    apiData.suggestions.menu_items.forEach(menuItem => {
      suggestions.push({
        id: `menu-${menuItem.id}`,
        type: 'menu_item',
        name: menuItem.name,
        description: menuItem.description,
        restaurant_name: menuItem.restaurant__name,
        restaurant_id: menuItem.restaurant__id,
        category_name: menuItem.menu_design_category__category__name
      });
    });
    console.log('Added menu items:', apiData.suggestions.menu_items.length); // Debug log
  }

  console.log('Total converted suggestions:', suggestions.length); // Debug log
  return suggestions;
};

// Fallback mock data for testing when API is not available
const getMockSuggestions = (query: string): Suggestion[] => {
  const lowerQuery = query.toLowerCase();
  const mockSuggestions: Suggestion[] = [];

  // Comprehensive mock restaurants
  const mockRestaurants = [
    { id: 9001, name: "Mario's Pizza Palace", keywords: ['pizza', 'italian', 'mario'] },
    { id: 9002, name: "Saki Sushi Bar", keywords: ['sushi', 'japanese', 'saki'] },
    { id: 9003, name: "Golden Dragon", keywords: ['chinese', 'dragon', 'golden'] },
    { id: 9004, name: "Burger Junction", keywords: ['burger', 'american', 'fast'] },
    { id: 9005, name: "Curry House", keywords: ['curry', 'indian', 'spicy'] },
    { id: 9006, name: "Thai Garden", keywords: ['thai', 'garden', 'asian'] },
    { id: 9007, name: "French Bistro", keywords: ['french', 'bistro', 'fine'] },
    { id: 9008, name: "Taco Fiesta", keywords: ['taco', 'mexican', 'fiesta'] },
    { id: 9009, name: "Greek Taverna", keywords: ['greek', 'taverna', 'mediterranean'] },
    { id: 9010, name: "BBQ Smokehouse", keywords: ['bbq', 'barbecue', 'smoke', 'meat'] }
  ];

  // Mock cuisine types
  const mockCuisines = [
    { id: 'cuisine-1', name: 'Italian', code: 'ITALIAN', keywords: ['ital', 'pizza', 'pasta'] },
    { id: 'cuisine-2', name: 'Chinese', code: 'CHINESE', keywords: ['chin', 'asian', 'noodle'] },
    { id: 'cuisine-3', name: 'Japanese', code: 'JAPANESE', keywords: ['jap', 'sushi', 'asian'] },
    { id: 'cuisine-4', name: 'Indian', code: 'INDIAN', keywords: ['ind', 'curry', 'spicy'] },
    { id: 'cuisine-5', name: 'Mexican', code: 'MEXICAN', keywords: ['mex', 'taco', 'burrito'] },
    { id: 'cuisine-6', name: 'Thai', code: 'THAI', keywords: ['thai', 'asian', 'spicy'] },
    { id: 'cuisine-7', name: 'French', code: 'FRENCH', keywords: ['fren', 'fine', 'bistro'] },
    { id: 'cuisine-8', name: 'American', code: 'AMERICAN', keywords: ['amer', 'burger', 'fast'] }
  ];

  // Mock venue types
  const mockVenueTypes = [
    { id: 'venue-1', name: 'Fine Dining', code: 'FINE_DINING', keywords: ['fine', 'elegant', 'upscale'] },
    { id: 'venue-2', name: 'Casual Dining', code: 'CASUAL', keywords: ['casual', 'family', 'relaxed'] },
    { id: 'venue-3', name: 'Fast Food', code: 'FAST_FOOD', keywords: ['fast', 'quick', 'takeaway'] },
    { id: 'venue-4', name: 'Cafe', code: 'CAFE', keywords: ['cafe', 'coffee', 'light'] },
    { id: 'venue-5', name: 'Bar', code: 'BAR', keywords: ['bar', 'drinks', 'pub'] }
  ];

  // Mock menu items
  const mockMenuItems = [
    { id: 'menu-1', name: 'Margherita Pizza', restaurant_name: "Mario's Pizza", restaurant_id: 9001, category_name: 'Main Course', keywords: ['pizza', 'margherita', 'cheese'] },
    { id: 'menu-2', name: 'California Roll', restaurant_name: "Saki Sushi", restaurant_id: 9002, category_name: 'Sushi', keywords: ['sushi', 'california', 'roll'] },
    { id: 'menu-3', name: 'Sweet and Sour Chicken', restaurant_name: "Golden Dragon", restaurant_id: 9003, category_name: 'Main Course', keywords: ['chicken', 'sweet', 'sour'] },
    { id: 'menu-4', name: 'Classic Burger', restaurant_name: "Burger Junction", restaurant_id: 9004, category_name: 'Burgers', keywords: ['burger', 'classic', 'beef'] }
  ];

  // Add matching restaurants
  mockRestaurants.forEach(restaurant => {
    if (restaurant.keywords.some(keyword => keyword.includes(lowerQuery) || lowerQuery.includes(keyword))) {
      mockSuggestions.push({
        id: restaurant.id,
        type: 'restaurant',
        name: restaurant.name
      });
    }
  });

  // Add matching cuisines
  mockCuisines.forEach(cuisine => {
    if (cuisine.keywords.some(keyword => keyword.includes(lowerQuery) || lowerQuery.includes(keyword))) {
      mockSuggestions.push({
        id: cuisine.id,
        type: 'cuisine_type',
        name: cuisine.name,
        code: cuisine.code
      });
    }
  });

  // Add matching venue types
  mockVenueTypes.forEach(venue => {
    if (venue.keywords.some(keyword => keyword.includes(lowerQuery) || lowerQuery.includes(keyword))) {
      mockSuggestions.push({
        id: venue.id,
        type: 'venue_type',
        name: venue.name,
        code: venue.code
      });
    }
  });

  // Add matching menu items
  mockMenuItems.forEach(item => {
    if (item.keywords.some(keyword => keyword.includes(lowerQuery) || lowerQuery.includes(keyword))) {
      mockSuggestions.push({
        id: item.id,
        type: 'menu_item',
        name: item.name,
        restaurant_name: item.restaurant_name,
        restaurant_id: item.restaurant_id,
        category_name: item.category_name
      });
    }
  });

  // If no specific matches, provide some general suggestions
  if (mockSuggestions.length === 0 && lowerQuery.length >= 2) {
    mockSuggestions.push(
      {
        id: 'default-1',
        type: 'cuisine_type',
        name: 'Italian',
        code: 'ITALIAN'
      },
      {
        id: 99999,
        type: 'restaurant',
        name: "Mario's Pizza Palace"
      },
      {
        id: 'default-3',
        type: 'venue_type',
        name: 'Casual Dining',
        code: 'CASUAL'
      }
    );
  }

  console.log(`🎯 Mock suggestions for "${query}":`, mockSuggestions);
  return mockSuggestions.slice(0, 8); // Limit to 8 suggestions
};

// --- Component Props ---
interface PredictiveSearchDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion: (suggestion: Suggestion) => void;
  showRecentSearches?: boolean; // Show recent searches when no query
}

const PredictiveSearchDropdown: FC<PredictiveSearchDropdownProps> = ({
  query,
  isOpen,
  onClose,
  onSelectSuggestion,
  showRecentSearches = true
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSuggestion[]>([]);
  const router = useRouter();

  // Default filters state
  const [filters, setFilters] = useState({
    takeAway: true,
    dining: true,
    childFriendly: true,
  });

  // Load recent searches on component mount
  useEffect(() => {
    if (showRecentSearches) {
      setRecentSearches(getRecentSearches());
    }
  }, [showRecentSearches]);

  // Get "Restaurants Near Me" suggestion
  const getNearMeSuggestion = (): NearMeSuggestion => ({
    id: 'near-me-default',
    type: 'near_me',
    text: 'Restaurants Near Me',
    description: 'Find restaurants within your selected distance range'
  });

  // Fetch suggestions based on query
  useEffect(() => {
    console.log(`🔄 Autocomplete useEffect triggered - Query: "${query}", Length: ${query.length}`);
    
    if (!query.trim()) {
      if (showRecentSearches) {
        setRecentSearches(getRecentSearches());
      }
      setSuggestions([]);
      setLoading(false);
      console.log('❌ Query empty, clearing suggestions');
      return;
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      console.log('❌ Query too short, clearing suggestions');
      return;
    }

    console.log('🔄 Starting autocomplete search for:', query);
    setLoading(true);

    const fetchSuggestions = async () => {
      console.log('📡 Fetching suggestions for query:', query);
      
      // IMMEDIATELY set mock suggestions to prevent long loading
      const mockSuggestions = getMockSuggestions(query);
      console.log('📦 Generated mock suggestions:', mockSuggestions.length, mockSuggestions);
      
      // Set mock suggestions immediately
      setSuggestions(mockSuggestions);
      setLoading(false);
      console.log('✅ Mock suggestions set immediately');
      
      // Then try API in background (optional enhancement)
      try {
        const apiData = await fetchAutocompleteData(query);
        if (apiData && apiData.suggestions) {
          console.log('✅ API data received:', apiData);
          const convertedSuggestions = convertApiDataToSuggestions(apiData);
          console.log('🔄 Converted API suggestions:', convertedSuggestions.length);
          
          if (convertedSuggestions.length > 0) {
            setSuggestions(convertedSuggestions);
            console.log('✅ Replaced with API suggestions');
          }
        }
      } catch (apiError) {
        console.log('⚠️ API failed, keeping mock suggestions:', apiError);
        // Keep mock suggestions that were already set
      }
    };

    // Shorter debounce for better responsiveness
    const debounceTimeout = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounceTimeout);
  }, [query, showRecentSearches]);

  // Handle suggestion selection with search redirects
  const handleSuggestionClick = (suggestion: Suggestion) => {
    let searchQuery = '';
    let searchParams = new URLSearchParams();

    switch (suggestion.type) {
      case 'restaurant':
        searchQuery = suggestion.name;
        searchParams.set('query', suggestion.name);
        searchParams.set('type', 'restaurant');
        break;
      case 'venue_type':
        searchQuery = suggestion.name;
        searchParams.set('query', suggestion.name);
        searchParams.set('venue_type', suggestion.code);
        break;
      case 'cuisine_type':
        searchQuery = suggestion.name;
        searchParams.set('query', suggestion.name);
        searchParams.set('cuisine', suggestion.code);
        break;
      case 'amenity':
        searchQuery = suggestion.name;
        searchParams.set('query', suggestion.name);
        searchParams.set('amenity', suggestion.code);
        break;
      case 'menu_item':
        searchQuery = suggestion.name;
        searchParams.set('query', suggestion.name);
        searchParams.set('type', 'menu_item');
        searchParams.set('restaurant_id', suggestion.restaurant_id.toString());
        break;
      case 'recent':
        searchQuery = suggestion.text;
        searchParams.set('query', suggestion.text);
        break;
      case 'near_me':
        searchQuery = suggestion.text;
        searchParams.set('query', '');
        searchParams.set('near_me', 'true');
        break;
      default:
        searchQuery = query;
        searchParams.set('query', query);
    }

    // Log suggestion selection
    console.log('🎯 SUGGESTION SELECTED:');
    console.log('- Suggestion Type:', suggestion.type);
    console.log('- Suggestion Data:', suggestion);
    console.log('- Search Query:', searchQuery);
    console.log('- URL Parameters:', searchParams.toString());
    console.log('- Final URL:', `/listing-stay-map?${searchParams.toString()}`);

    // Add to recent searches
    if (searchQuery && suggestion.type !== 'recent') {
      addRecentSearch(searchQuery);
    }

    // Call the original callback
    onSelectSuggestion(suggestion);

    // Navigate to results page
    router.push(`/listing-stay-map?${searchParams.toString()}` as any);
  };

  const renderSuggestion = (suggestion: Suggestion) => {
    const handleClick = () => handleSuggestionClick(suggestion);

    switch (suggestion.type) {
      case 'recent':
        return (
          <div key={suggestion.id} className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-sm flex items-center gap-2" onClick={handleClick}>
            <ClockIcon className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-600 dark:text-neutral-300">{suggestion.text}</span>
          </div>
        );
      case 'near_me':
        return (
          <div key={suggestion.id} className="px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer" onClick={handleClick}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded flex items-center justify-center flex-shrink-0">
                <MapPinIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-grow min-w-0">
                <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200 truncate">{suggestion.text}</div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400">{suggestion.description}</div>
              </div>
            </div>
          </div>
        );
      case 'restaurant':
        return (
          <div key={suggestion.id} className="px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer" onClick={handleClick}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded flex items-center justify-center flex-shrink-0">
                <MagnifyingGlassIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-grow min-w-0">
                <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{suggestion.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Restaurant</div>
              </div>
            </div>
          </div>
        );
      case 'venue_type':
        return (
          <div key={suggestion.id} className="px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer" onClick={handleClick}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-grow min-w-0">
                <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{suggestion.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Venue Type</div>
              </div>
            </div>
          </div>
        );
      case 'cuisine_type':
        return (
          <div key={suggestion.id} className="px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer" onClick={handleClick}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                   </div>
              <div className="flex-grow min-w-0">
                <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{suggestion.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Cuisine Type</div>
              </div>
            </div>
          </div>
        );
      case 'amenity':
         return (
          <div key={suggestion.id} className="px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer" onClick={handleClick}>
             <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
               <div className="flex-grow min-w-0">
                 <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{suggestion.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{suggestion.category_name}</div>
              </div>
               </div>
             </div>
         );
      case 'menu_item':
        return (
          <div key={suggestion.id} className="px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer" onClick={handleClick}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zm-2 1a1 1 0 011-1h.01a1 1 0 110 2H12a1 1 0 01-1-1zm-2-1a1 1 0 100 2h.01a1 1 0 100-2H9zm-2 1a1 1 0 011-1h.01a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-grow min-w-0">
                <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{suggestion.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {suggestion.restaurant_name} • {suggestion.category_name}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Group suggestions by category
  const restaurants = suggestions.filter(s => s.type === 'restaurant');
  const venueTypes = suggestions.filter(s => s.type === 'venue_type');
  const cuisineTypes = suggestions.filter(s => s.type === 'cuisine_type');
  const amenities = suggestions.filter(s => s.type === 'amenity');
  const menuItems = suggestions.filter(s => s.type === 'menu_item');

  const shouldShowRecentSearches = !query.trim() && recentSearches.length > 0 && showRecentSearches;
  const hasAnySuggestions = suggestions.length > 0 || shouldShowRecentSearches || loading;

  console.log('🎨 Render conditions:', {
    isOpen,
    hasAnySuggestions,
    suggestionsCount: suggestions.length,
    shouldShowRecentSearches,
    loading,
    query: query.trim()
  });

  if (!isOpen) return null;

  return (
    <div className="absolute z-50 top-full left-0 right-0 mt-1 w-full shadow-lg rounded-b-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 overflow-hidden max-h-[48vh] flex flex-col">
      
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 py-1 bg-yellow-50 border-b text-xs text-yellow-800">
          Debug: Loading: {loading.toString()}, Suggestions: {suggestions.length}, Query: "{query}"
        </div>
      )}
      
      {loading && suggestions.length === 0 && (
        <div className="p-4 text-center text-sm text-neutral-500">Loading suggestions...</div>
      )}
      
      {!loading && shouldShowRecentSearches && (
        <div className="py-2">
          {/* Always show "Restaurants Near Me" first */}
          <div className="mb-2">
            {renderSuggestion(getNearMeSuggestion())}
          </div>
          
          {recentSearches.length > 0 && (
            <>
              <div className="px-4 pb-2 text-xs font-semibold text-neutral-500 uppercase border-t pt-2">Recent Searches</div>
              {recentSearches.map(renderSuggestion)}
            </>
          )}
        </div>
      )}

      {!loading && query.trim() && suggestions.length === 0 && (
        <div className="p-4 text-center text-sm text-neutral-500">
          <p>No results found for "{query}"</p>
          <p className="text-xs mt-2 text-neutral-400">Try: "pizza", "italian", "sushi", "burger"</p>
        </div>
      )}

      {(!loading || suggestions.length > 0) && suggestions.length > 0 && (
        <div className="flex flex-grow overflow-y-auto">
          {/* Left Panel: Categories */}
          <div className="w-1/2 border-r border-neutral-200 dark:border-neutral-700 py-2 flex-shrink-0 overflow-y-auto">
            {restaurants.length > 0 && (
              <div className="mb-4">
                <div className="px-4 pb-2 text-xs font-semibold text-neutral-500 uppercase">Restaurants ({restaurants.length})</div>
                {restaurants.map(renderSuggestion)}
              </div>
            )}
            
            {venueTypes.length > 0 && (
              <div className="mb-4">
                <div className="px-4 pb-2 text-xs font-semibold text-neutral-500 uppercase">Venue Types ({venueTypes.length})</div>
                {venueTypes.map(renderSuggestion)}
              </div>
            )}
            
            {cuisineTypes.length > 0 && (
              <div className="mb-4">
                <div className="px-4 pb-2 text-xs font-semibold text-neutral-500 uppercase">Cuisine Types ({cuisineTypes.length})</div>
                {cuisineTypes.map(renderSuggestion)}
              </div>
            )}
      </div>

          {/* Right Panel: Menu Items & Amenities */}
          <div className="w-1/2 py-2 flex-grow overflow-y-auto">
            {menuItems.length > 0 && (
              <div className="mb-4">
                <div className="px-4 pb-2 text-xs font-semibold text-neutral-500 uppercase">Menu Items ({menuItems.length})</div>
                {menuItems.map(renderSuggestion)}
              </div>
            )}
            
            {amenities.length > 0 && (
              <div className="mb-4">
                <div className="px-4 pb-2 text-xs font-semibold text-neutral-500 uppercase">Amenities ({amenities.length})</div>
                {amenities.map(renderSuggestion)}
              </div>
            )}
            
            {suggestions.length > 0 && menuItems.length === 0 && amenities.length === 0 && (
              <div className="px-4 text-sm text-neutral-400 italic">Additional results appear here...</div>
            )}
          </div>
        </div>
      )}

      {/* Footer with Default Filters */}
      <div className="flex-shrink-0 p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-start gap-4">
         <Checkbox
            name="filter-takeaway"
            label="Take Away"
            checked={filters.takeAway}
            onChange={(checked) => setFilters(f => ({ ...f, takeAway: checked }))}
            className="text-sm"
            labelClassName="text-xs"
         />
         <Checkbox
            name="filter-dining"
            label="Dining"
            checked={filters.dining}
            onChange={(checked) => setFilters(f => ({ ...f, dining: checked }))}
            className="text-sm"
            labelClassName="text-xs"
          />
         <Checkbox
            name="filter-childfriendly"
            label="Child Friendly"
            checked={filters.childFriendly}
            onChange={(checked) => setFilters(f => ({ ...f, childFriendly: checked }))}
            className="text-sm"
            labelClassName="text-xs"
         />
      </div>
    </div>
  );
};

export default PredictiveSearchDropdown; 