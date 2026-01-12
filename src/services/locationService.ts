// Location-based restaurant filtering service

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  accuracy?: number;
}

export interface LocationError {
  code: number;
  message: string;
  userMessage: string;
}

export interface RestaurantWithDistance {
  id: string | number;
  distance: number;
  bearing?: number; // Direction from user to restaurant (0-360 degrees)
  [key: string]: any; // Allow other restaurant properties
}

// Haversine formula to calculate distance between two coordinates
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Calculate bearing (direction) from point A to point B
export const calculateBearing = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const dLng = toRadians(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRadians(lat2));
  const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
            Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLng);
  
  let bearing = Math.atan2(y, x);
  bearing = toDegrees(bearing);
  return (bearing + 360) % 360; // Normalize to 0-360
};

const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
const toDegrees = (radians: number): number => radians * (180 / Math.PI);

// Get user's current location with maximum accuracy and Google Maps integration
export const getCurrentLocation = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject({
        code: 0,
        message: 'Geolocation not supported',
        userMessage: 'Your browser doesn\'t support location services'
      } as LocationError);
      return;
    }

    // Maximum accuracy settings for precise location
    const options = {
      enableHighAccuracy: true,
      timeout: 20000, // Longer timeout for maximum accuracy
      maximumAge: 0 // Always get fresh location, no cache
    };

    console.log('🎯 Requesting maximum accuracy location...');

    // Try multiple attempts if first one has poor accuracy
    let attempts = 0;
    const maxAttempts = 3;

    const attemptLocation = () => {
      attempts++;
      console.log(`📡 Location attempt ${attempts}/${maxAttempts}`);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          console.log(`📍 GPS coordinates received: ${latitude}, ${longitude} (accuracy: ±${accuracy}m)`);
          
          // If accuracy is poor and we haven't tried all attempts, try again
          if (accuracy && accuracy > 1000 && attempts < maxAttempts) {
            console.log(`⚠️ Poor accuracy (${accuracy}m), attempting again...`);
            setTimeout(attemptLocation, 1000);
            return;
          }
          
          try {
            // Get multiple location results and choose the best one
            const locationResults = await getMultipleLocationResults(latitude, longitude);
            
            if (locationResults.length > 0) {
              const bestResult = locationResults[0]; // Already sorted by confidence
              
              const finalLocation = {
                lat: latitude,
                lng: longitude,
                accuracy,
                city: bestResult.city,
                state: bestResult.state,
                postcode: bestResult.postcode,
                country: bestResult.country
              };
              
              console.log(`✅ Best location result (${bestResult.confidence}% confidence):`, finalLocation);
              resolve(finalLocation);
            } else {
              console.warn('⚠️ No geocoding services returned results, using coordinates only');
              resolve({
                lat: latitude,
                lng: longitude,
                accuracy
              });
            }
          } catch (error) {
            console.warn('⚠️ Location processing failed, returning coordinates only:', error);
            resolve({
              lat: latitude,
              lng: longitude,
              accuracy
            });
          }
        },
        (error) => {
          if (attempts < maxAttempts && error.code === 3) { // Timeout
            console.log(`⏱️ Location timeout, attempting again (${attempts}/${maxAttempts})`);
            setTimeout(attemptLocation, 1000);
            return;
          }
          
          console.error('❌ Geolocation error after all attempts:', error);
          const locationError: LocationError = {
            code: error.code,
            message: error.message,
            userMessage: getLocationErrorMessage(error.code)
          };
          reject(locationError);
        },
        options
      );
    };

    attemptLocation();
  });
};

// Global location confidence scoring system
const evaluateLocationConfidence = (
  location: Partial<UserLocation>, 
  accuracy?: number,
  source?: string
): { confidence: number; issues: string[] } => {
  let confidence = 0;
  const issues: string[] = [];
  
  // Base confidence from GPS accuracy
  if (accuracy) {
    if (accuracy <= 100) confidence += 40; // Excellent accuracy
    else if (accuracy <= 500) confidence += 30; // Good accuracy  
    else if (accuracy <= 1000) confidence += 20; // Fair accuracy
    else if (accuracy <= 5000) confidence += 10; // Poor accuracy
    else issues.push(`Low GPS accuracy (±${Math.round(accuracy)}m)`);
  }
  
  // Confidence from geocoding service
  if (source === 'Google Maps') confidence += 30; // Google is generally most accurate
  else if (source === 'Nominatim') confidence += 20; // OSM is good but less precise
  
  // Confidence from address completeness
  if (location.city) confidence += 20;
  else issues.push('No city detected');
  
  if (location.state) confidence += 5;
  if (location.postcode) confidence += 5;
  
  return { confidence, issues };
};

// Get multiple location results for comparison and validation
const getMultipleLocationResults = async (lat: number, lng: number): Promise<Array<Partial<UserLocation> & { source: string; confidence: number }>> => {
  const results: Array<Partial<UserLocation> & { source: string; confidence: number }> = [];
  
  // Try Google Maps first (most accurate globally)
  try {
    const googleResult = await reverseGeocodeWithGoogleMaps(lat, lng);
    if (googleResult.city) {
      const evaluation = evaluateLocationConfidence(googleResult, undefined, 'Google Maps');
      results.push({ 
        ...googleResult, 
        source: 'Google Maps',
        confidence: evaluation.confidence
      });
      console.log('✅ Google Maps result:', googleResult, `Confidence: ${evaluation.confidence}%`);
    }
  } catch (error) {
    console.warn('Google Maps geocoding failed:', error);
  }

  // Try Enhanced Nominatim
  try {
    const nominatimResult = await reverseGeocodeWithNominatimEnhanced(lat, lng);
    if (nominatimResult.city) {
      const evaluation = evaluateLocationConfidence(nominatimResult, undefined, 'Nominatim');
      results.push({ 
        ...nominatimResult, 
        source: 'Nominatim',
        confidence: evaluation.confidence
      });
      console.log('✅ Nominatim result:', nominatimResult, `Confidence: ${evaluation.confidence}%`);
    }
  } catch (error) {
    console.warn('Nominatim geocoding failed:', error);
  }

  return results.sort((a, b) => b.confidence - a.confidence); // Sort by confidence
};

// Enhanced Nominatim (OpenStreetMap) with global optimization
const reverseGeocodeWithNominatimEnhanced = async (lat: number, lng: number): Promise<Partial<UserLocation>> => {
  console.log(`🌍 Nominatim enhanced geocoding: ${lat}, ${lng}`);
  
  // Use highest zoom level for maximum precision
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?` + 
    `format=json&lat=${lat}&lon=${lng}&` +
    `zoom=18&addressdetails=1&accept-language=en&` +
    `extratags=1&namedetails=1&limit=1`,
    {
      headers: {
        'User-Agent': 'RestaurantReviews/1.0 (Location Services)'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Nominatim request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data || !data.address) {
    throw new Error('Nominatim returned no address data');
  }
  
  const address = data.address;
  
  // Global city detection with comprehensive fallback
  const city = address.city || 
               address.town || 
               address.municipality || 
               address.village || 
               address.hamlet || 
               address.suburb || 
               address.neighbourhood ||
               address.locality ||
               address.county ||
               address.district;
  
  const state = address.state || 
                address.region || 
                address.province ||
                address.state_district ||
                address.administrative_area_level_1;

  const result = {
    city,
    state,
    postcode: address.postcode || address.postal_code,
    country: address.country
  };

  console.log('🗺️ Nominatim enhanced response:', { 
    formatted_address: data.display_name,
    raw_address: address, 
    extracted: result,
    osm_type: data.osm_type,
    osm_id: data.osm_id
  });
  
  return result;
};

// Enhanced Google Maps Geocoding API for global accuracy
const reverseGeocodeWithGoogleMaps = async (lat: number, lng: number): Promise<Partial<UserLocation>> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('Google Maps API key not available, using fallback');
    throw new Error('Google Maps API key not available');
  }

  console.log(`🌍 Google Maps geocoding: ${lat}, ${lng}`);

  // Use Google Maps with proper settings for maximum accuracy
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?` +
    `latlng=${lat},${lng}&key=${apiKey}&language=en&location_type=ROOFTOP|RANGE_INTERPOLATED`
  );
  
  if (!response.ok) {
    throw new Error(`Google Maps request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.status !== 'OK') {
    console.warn('Google Maps API error:', data.status, data.error_message);
    throw new Error(`Google Maps API error: ${data.status}`);
  }

  if (!data.results || data.results.length === 0) {
    throw new Error('Google Maps returned no results');
  }

  // Find the most precise result
  let bestResult = data.results[0];
  
  // Prefer results with better location types
  const preciseResults = data.results.filter((result: any) => 
    result.geometry?.location_type === 'ROOFTOP' || 
    result.geometry?.location_type === 'RANGE_INTERPOLATED'
  );
  
  if (preciseResults.length > 0) {
    bestResult = preciseResults[0];
    console.log('✅ Using precise location type:', bestResult.geometry.location_type);
  }

  const components = bestResult.address_components || [];
  
  let city = '';
  let state = '';
  let postcode = '';
  let country = '';

  // Extract address components with priority order
  components.forEach((component: any) => {
    const types = component.types;
    
    // City/locality with priority order
    if (!city) {
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('sublocality_level_1')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        city = component.long_name;
      }
    }
    
    // State/region
    if (types.includes('administrative_area_level_1')) {
      state = component.long_name; // Use long_name for better readability
    }
    
    // Postal code
    if (types.includes('postal_code')) {
      postcode = component.long_name;
    }
    
    // Country
    if (types.includes('country')) {
      country = component.long_name;
    }
  });

  // If no city found in standard places, try broader search
  if (!city) {
    components.forEach((component: any) => {
      const types = component.types;
      if (!city && (types.includes('sublocality') || types.includes('neighborhood'))) {
        city = component.long_name;
      }
    });
  }

  const result = { city, state, postcode, country };
  console.log('🗺️ Google Maps extracted location:', result);
  console.log('🗺️ Full address:', bestResult.formatted_address);
  
  return result;
};

// Mapbox Geocoding API (free tier available)
const reverseGeocodeWithMapbox = async (lat: number, lng: number): Promise<Partial<UserLocation>> => {
  // Note: This would require a Mapbox token, implementing as placeholder
  throw new Error('Mapbox not configured');
};

// Get user-friendly error messages
const getLocationErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      return 'Location access denied. Please enable location services in your browser settings.';
    case 2:
      return 'Unable to determine your location. Please check your internet connection.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'Unable to access your location. Please try again or enter your location manually.';
  }
};

// Filter restaurants by distance range
export const filterRestaurantsByDistance = (
  restaurants: any[],
  userLocation: UserLocation,
  distanceRange: string
): RestaurantWithDistance[] => {
  const [minDistance, maxDistance] = distanceRange.split('-').map(Number);
  
  console.log(`🌍 Filtering restaurants by distance: ${minDistance}-${maxDistance}km from`, userLocation);
  
  const filteredRestaurants = restaurants
    .map(restaurant => {
      // Handle different coordinate formats
      let restaurantLat: number;
      let restaurantLng: number;
      
      if (restaurant.map) {
        restaurantLat = restaurant.map.lat;
        restaurantLng = restaurant.map.lng;
      } else if (restaurant.latitude && restaurant.longitude) {
        restaurantLat = restaurant.latitude;
        restaurantLng = restaurant.longitude;
      } else {
        // Skip restaurants without coordinates
        return null;
      }
      
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        restaurantLat,
        restaurantLng
      );
      
      const bearing = calculateBearing(
        userLocation.lat,
        userLocation.lng,
        restaurantLat,
        restaurantLng
      );
      
      return {
        ...restaurant,
        distance,
        bearing
      } as RestaurantWithDistance;
    })
    .filter((restaurant): restaurant is RestaurantWithDistance => {
      return restaurant !== null && 
             restaurant.distance >= minDistance && 
             restaurant.distance <= maxDistance;
    })
    .sort((a, b) => a.distance - b.distance); // Sort by distance
  
  console.log(`🎯 Found ${filteredRestaurants.length} restaurants within ${distanceRange}km`);
  return filteredRestaurants;
};

// Get direction text from bearing
export const getDirectionFromBearing = (bearing: number): string => {
  const directions = [
    'North', 'North-East', 'East', 'South-East',
    'South', 'South-West', 'West', 'North-West'
  ];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

// Format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};

// Global location accuracy assessment
export const assessLocationAccuracy = (location: UserLocation): {
  isAccurate: boolean;
  confidence: number;
  recommendations: string[];
} => {
  const recommendations: string[] = [];
  let confidence = 100;
  
  // Check GPS accuracy
  if (location.accuracy) {
    if (location.accuracy > 5000) {
      confidence -= 40;
      recommendations.push('GPS accuracy is poor - try moving to an open area');
    } else if (location.accuracy > 1000) {
      confidence -= 20;
      recommendations.push('GPS accuracy could be better');
    }
  }
  
  // Check address completeness
  if (!location.city) {
    confidence -= 30;
    recommendations.push('City not detected - location may be imprecise');
  }
  
  if (!location.state && !location.country) {
    confidence -= 10;
    recommendations.push('Region information missing');
  }
  
  return {
    isAccurate: confidence >= 70,
    confidence: Math.max(0, confidence),
    recommendations
  };
};

// Get suggested search radius based on location type (global)
export const getSuggestedRadius = (location: UserLocation): string => {
  if (!location.city) return '1-10';
  
  // Global city size estimation based on country and common patterns
  const city = location.city.toLowerCase();
  const country = location.country?.toLowerCase() || '';
  
  // Major global cities - larger radius
  const majorCities = [
    'new york', 'london', 'tokyo', 'mumbai', 'delhi', 'shanghai', 'beijing',
    'los angeles', 'chicago', 'toronto', 'sydney', 'melbourne', 'dubai',
    'singapore', 'hong kong', 'bangkok', 'jakarta', 'manila', 'cairo',
    'istanbul', 'moscow', 'st petersburg', 'berlin', 'madrid', 'rome',
    'paris', 'barcelona', 'amsterdam', 'stockholm', 'oslo', 'copenhagen'
  ];
  
  if (majorCities.some(major => city.includes(major) || major.includes(city))) {
    return '1-15'; // Larger cities
  }
  
  // Country-based defaults
  if (['india', 'china', 'usa', 'united states'].includes(country)) {
    return '1-12'; // Large countries, medium radius
  } else if (['singapore', 'hong kong', 'monaco'].includes(country)) {
    return '1-8'; // Small countries/city-states
  } else {
    return '1-10'; // Default for most locations
  }
};
