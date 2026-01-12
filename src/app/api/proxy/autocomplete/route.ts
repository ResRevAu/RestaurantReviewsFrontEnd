import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - this route cannot be statically generated
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const limit = searchParams.get('limit') || '5';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Try the primary API endpoint using restaurantreviews.io
    const apiUrl = `https://restaurantreviews.io/api/restaurants/autocomplete/?query=${encodeURIComponent(query)}&limit=${limit}`;
    
    console.log('Proxy: Fetching from API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Proxy: API error:', response.status, response.statusText);
      return NextResponse.json({ 
        error: 'API request failed',
        status: response.status 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Proxy: API response:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy: Fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch autocomplete data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
