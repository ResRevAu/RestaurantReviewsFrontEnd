// Restaurant API service for fetching real restaurant data
import { calculateDistanceSimple } from './simpleLocationService';

interface RestaurantSearchParams {
  query?: string;
  type?: string;
  venue_type?: string;
  cuisine?: string;
  amenity?: string;
  restaurant_id?: string;
  page?: number;
  limit?: number;
}

interface Restaurant {
  id: number;
  name: string;
  owner: number;
  owner_name: string;
  phone: string;
  website: string;
  email: string;
  country: string;
  street_address: string;
  room_number?: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  venue_types: Array<{id: number; name: string; code: string}>;
  cuisine_styles: Array<{id: number; name: string; code: string}>;
  logo?: string;
  is_approved: boolean;
  total_images: number;
  has_operating_hours: boolean;
  review_count: number;
  created_at: string;
  updated_at: string;
  images: any[];
  videos: any[];
  operating_hours: any[];
  holiday_hours: any[];
  amenities: any;
}

interface RestaurantApiResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Restaurant[];
}

const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://restaurantreviews.io';
};

export const searchRestaurants = async (params: RestaurantSearchParams & {
  userLocation?: { lat: number; lng: number; maxDistance?: number }
}): Promise<RestaurantApiResponse | null> => {
  console.log('🔍 Starting restaurant search with params:', params);
  
  try {
    const baseUrl = getApiBaseUrl();
    const searchParams = new URLSearchParams();
    
    // Add search parameters
    if (params.query) searchParams.set('search', params.query);
    if (params.venue_type) searchParams.set('venue_type', params.venue_type);
    if (params.cuisine) searchParams.set('cuisine', params.cuisine);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    
    // Add location-based search if user location is provided
    if (params.userLocation) {
      console.log('📍 Adding location-based search:', params.userLocation);
      searchParams.set('lat', params.userLocation.lat.toString());
      searchParams.set('lon', params.userLocation.lng.toString());
      searchParams.set('radius', (params.userLocation.maxDistance || 10).toString());
    }
    
    // Always get approved restaurants
    searchParams.set('approved', 'true');
    
    const url = `${baseUrl}/api/restaurants/?${searchParams.toString()}`;
    
    console.log('🌐 Fetching restaurants from API:', url);
    console.log('📋 API Parameters:', Object.fromEntries(searchParams.entries()));
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
    console.log('📡 API Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.warn('❌ Restaurant API error:', response.status, response.statusText);
      console.log('🔄 Trying alternative endpoints...');
      return await tryAlternativeRestaurantEndpoints(params);
    }
    
    const data = await response.json();
    console.log('🏪 Restaurant API SUCCESS - Response data:', data);
    console.log('📊 API returned restaurants count:', data.count || data.results?.length || 0);
    
    if (data.results && data.results.length > 0) {
      console.log('✅ API restaurants with coordinates:');
      data.results.slice(0, 5).forEach((restaurant: any, index: number) => {
        console.log(`  ${index + 1}. ${restaurant.name}: lat=${restaurant.latitude}, lng=${restaurant.longitude}`);
        
        // Validate restaurant coordinates are reasonable for user's area
        if (params.userLocation && restaurant.latitude && restaurant.longitude) {
          const distance = calculateDistanceSimple(
            params.userLocation.lat,
            params.userLocation.lng,
            restaurant.latitude,
            restaurant.longitude
          );
          console.log(`      📍 Distance from user: ${distance.toFixed(2)}km`);
        }
      });
      
      // Filter out restaurants with invalid coordinates
      data.results = data.results.filter((restaurant: any) => {
        const hasValidCoords = restaurant.latitude && restaurant.longitude && 
                             restaurant.latitude !== 0 && restaurant.longitude !== 0;
        if (!hasValidCoords) {
          console.log(`❌ Filtering out ${restaurant.name} - invalid coordinates`);
        }
        return hasValidCoords;
      });
      
      console.log(`📊 After coordinate validation: ${data.results.length} restaurants`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Restaurant API fetch error:', error);
    console.log('🔄 Trying alternative endpoints due to error...');
    return await tryAlternativeRestaurantEndpoints(params);
  }
};

const tryAlternativeRestaurantEndpoints = async (params: RestaurantSearchParams): Promise<RestaurantApiResponse | null> => {
  console.log('🔄 Trying alternative restaurant endpoints...');
  
  const alternativeUrls = [
    'https://restaurantreviews.io/api/restaurants/', // Primary URL
    '/api/proxy/restaurants/', // Local proxy endpoint (CORS-free) 
    'http://35.92.149.12/api/restaurants/', // Backup IP
    'http://localhost:8000/api/restaurants/' // Development
  ];

  for (let i = 0; i < alternativeUrls.length; i++) {
    const baseUrl = alternativeUrls[i];
    
    try {
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.set('search', params.query);
      if (params.venue_type) searchParams.set('venue_type', params.venue_type);
      if (params.cuisine) searchParams.set('cuisine', params.cuisine);
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      searchParams.set('approved', 'true');
      
      let url: string;
      if (baseUrl.startsWith('/')) {
        url = `${baseUrl}?${searchParams.toString()}`;
      } else {
        url = `${baseUrl}?${searchParams.toString()}`;
      }
      
      console.log(`🌐 [${i + 1}/${alternativeUrls.length}] Trying: ${url}`);
      
      const fetchConfig: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      // Add CORS mode only for external URLs
      if (!baseUrl.startsWith('/')) {
        fetchConfig.mode = 'cors';
      }
      
      const response = await fetch(url, fetchConfig);
      
      console.log(`📡 [${i + 1}] Response:`, response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS with endpoint [${i + 1}]:`, baseUrl);
        console.log('📊 Data received:', {
          count: data.count,
          resultsLength: data.results?.length || 0,
          hasResults: !!(data.results && data.results.length > 0)
        });
        
        if (data.results && data.results.length > 0) {
          return data;
        } else {
          console.log(`⚠️ Endpoint returned empty results, trying next...`);
        }
      } else {
        console.log(`❌ [${i + 1}] Failed:`, response.status, response.statusText);
      }
    } catch (error) {
      console.error(`❌ [${i + 1}] Exception:`, baseUrl, error);
      continue;
    }
  }
  
  console.log('❌ All restaurant API endpoints failed or returned empty results');
  return null;
};

// Convert restaurant data to the format expected by the UI components
export const convertRestaurantToStayCard = (restaurant: Restaurant): any => {
  console.log('🔄 Converting restaurant:', {
    name: restaurant.name,
    id: restaurant.id,
    lat: restaurant.latitude,
    lng: restaurant.longitude,
    address: `${restaurant.street_address}, ${restaurant.city}, ${restaurant.state}`
  });

  const converted = {
    id: restaurant.id,
    href: `/restaurant/${restaurant.id}`,
    title: restaurant.name,
    listingCategory: {
      name: restaurant.venue_types?.[0]?.name || 'Restaurant',
      href: '#'
    },
    address: `${restaurant.street_address || ''}, ${restaurant.city}, ${restaurant.state}`.replace(/^, /, ''),
    reviewCount: restaurant.review_count || 0,
    like: false,
    galleryImgs: restaurant.images?.length > 0 
      ? restaurant.images.map(img => typeof img === 'string' ? img : img.image || img)
      : [restaurant.logo || '/images/placeholder-large.png'],
    price: '$$$',
    maxGuests: 8,
    bedrooms: 1,
    saleOff: restaurant.total_images > 5 ? '-10%' : undefined,
    isAds: false,
    map: {
      lat: restaurant.latitude,
      lng: restaurant.longitude
    }
  };

  console.log('✅ Converted restaurant result:', {
    title: converted.title,
    id: converted.id,
    mapLat: converted.map.lat,
    mapLng: converted.map.lng,
    hasValidCoordinates: !!(converted.map.lat && converted.map.lng && converted.map.lat !== 0 && converted.map.lng !== 0)
  });

  return converted;
};

// Enhanced mock restaurants specifically for Lucknow area with realistic coordinates
export const getMockRestaurants = (query: string): any[] => {
  const mockData = [
    // Restaurants with user's exact coordinates
    {
      id: 'lucknow-tunday',
      href: '/restaurant/lucknow-tunday',
      title: "Tunday Kababi",
      listingCategory: { name: 'Mughlai Restaurant', href: '#' },
      address: 'Aminabad, Lucknow, Uttar Pradesh',
      reviewCount: 1250,
      like: false,
      galleryImgs: ['/images/restaurant2.jpg'],
      price: '$$$',
      maxGuests: 12,
      bedrooms: 1,
      saleOff: '-10%',
      isAds: false,
      map: { lat: 26.890149520911205, lng: 80.99192260849836 }
    },
    {
      id: 'lucknow-royal-cafe',
      href: '/restaurant/lucknow-royal-cafe',
      title: "Royal Cafe",
      listingCategory: { name: 'Multi-Cuisine Restaurant', href: '#' },
      address: 'Hazratganj, Lucknow, Uttar Pradesh',
      reviewCount: 892,
      like: false,
      galleryImgs: ['/images/restaurant4.jpg'],
      price: '$$$$',
      maxGuests: 8,
      bedrooms: 1,
      isAds: false,
      map: { lat: 26.902206671897318, lng: 81.00095996994587 }
    },
    {
      id: 'lucknow-dastarkhwan',
      href: '/restaurant/lucknow-dastarkhwan',
      title: "Dastarkhwan",
      listingCategory: { name: 'North Indian Restaurant', href: '#' },
      address: 'Mahanagar, Lucknow, Uttar Pradesh',
      reviewCount: 675,
      like: false,
      galleryImgs: ['/images/restaurant6.jpg'],
      price: '$$',
      maxGuests: 10,
      bedrooms: 1,
      isAds: false,
      map: { lat: 26.902206671897318, lng: 81.00095996994587 }
    },
    // Additional realistic Lucknow restaurants
    {
      id: 'lucknow-kebab-corner',
      href: '/restaurant/lucknow-kebab-corner',
      title: "Kebab Corner",
      listingCategory: { name: 'Kebab Restaurant', href: '#' },
      address: 'Chowk, Lucknow, Uttar Pradesh',
      reviewCount: 534,
      like: false,
      galleryImgs: ['/images/restaurant8.jpg'],
      price: '$$',
      maxGuests: 6,
      bedrooms: 1,
      isAds: false,
      map: { lat: 26.885, lng: 80.992 } // Close to user coordinates
    },
    {
      id: 'lucknow-tea-point',
      href: '/restaurant/lucknow-tea-point',
      title: "Lucknow Tea Point",
      listingCategory: { name: 'Tea & Snacks', href: '#' },
      address: 'Indira Nagar, Lucknow, Uttar Pradesh',
      reviewCount: 423,
      like: false,
      galleryImgs: ['/images/restaurant10.jpg'],
      price: '$',
      maxGuests: 4,
      bedrooms: 1,
      isAds: false,
      map: { lat: 26.892, lng: 80.994 } // Very close to user coordinates
    },
    {
      id: 'lucknow-awadhi-palace',
      href: '/restaurant/lucknow-awadhi-palace',
      title: "Awadhi Palace",
      listingCategory: { name: 'Awadhi Cuisine', href: '#' },
      address: 'Gomti Nagar, Lucknow, Uttar Pradesh',
      reviewCount: 789,
      like: false,
      galleryImgs: ['/images/restaurant12.jpg'],
      price: '$$$',
      maxGuests: 15,
      bedrooms: 1,
      saleOff: '-15%',
      isAds: false,
      map: { lat: 26.888, lng: 80.995 } // Close to user coordinates
    }
  ];

  console.log('🍽️ Lucknow-area mock restaurants generated:', mockData.length);
  console.log('🗺️ All restaurants are within Lucknow area near user coordinates');

  if (query && query.trim()) {
    const filtered = mockData.filter(restaurant => 
      restaurant.title.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.listingCategory.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(query.toLowerCase())
    );
    console.log(`🔍 Filtered restaurants for "${query}":`, filtered.length);
    return filtered;
  }

  return mockData;
};

export type { Restaurant, RestaurantApiResponse, RestaurantSearchParams };
