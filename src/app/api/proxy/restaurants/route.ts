import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Extract all search parameters
  const search = searchParams.get('search');
  const venue_type = searchParams.get('venue_type');
  const cuisine = searchParams.get('cuisine');
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';

  try {
    // Build the API URL with parameters
    const apiParams = new URLSearchParams();
    if (search) apiParams.set('search', search);
    if (venue_type) apiParams.set('venue_type', venue_type);
    if (cuisine) apiParams.set('cuisine', cuisine);
    apiParams.set('page', page);
    apiParams.set('limit', limit);
    apiParams.set('approved', 'true'); // Only get approved restaurants
    
    const apiUrl = `https://restaurantreviews.io/api/restaurants/?${apiParams.toString()}`;
    
    console.log('Restaurant Proxy: Fetching from API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Restaurant Proxy: API error:', response.status, response.statusText);
      return NextResponse.json({ 
        error: 'Restaurant API request failed',
        status: response.status 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Restaurant Proxy: API response count:', data.count || 0);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Restaurant Proxy: Fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch restaurant data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
