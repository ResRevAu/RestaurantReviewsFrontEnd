"use client";

import React, { useState, useEffect } from 'react';

const ApiEndpointTester: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    testAllEndpoints();
  }, []);

  const testAllEndpoints = async () => {
    const endpoints = [
      'https://restaurantreviews.io/api/restaurants/?approved=true&limit=5', // Primary
      '/api/proxy/restaurants/?approved=true&limit=5', // Proxy (CORS-free)
      'http://35.92.149.12/api/restaurants/?approved=true&limit=5', // Backup IP
      'http://localhost:8000/api/restaurants/?approved=true&limit=5' // Development
    ];

    console.log('🧪 ===== TESTING ALL API ENDPOINTS =====');

    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      console.log(`🌐 [${i + 1}/${endpoints.length}] Testing: ${endpoint}`);
      
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: endpoint.startsWith('/') ? 'same-origin' : 'cors'
        });

        console.log(`📡 [${i + 1}] Response: ${response.status} ${response.statusText}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ [${i + 1}] SUCCESS:`, {
            endpoint,
            count: data.count || data.results?.length || 0,
            hasResults: !!(data.results && data.results.length > 0)
          });

          if (data.results && data.results.length > 0) {
            console.log(`📊 [${i + 1}] First 3 restaurants:`, 
              data.results.slice(0, 3).map((r: any) => ({
                name: r.name,
                lat: r.latitude,
                lng: r.longitude,
                city: r.city
              }))
            );
            
            setResults(prev => [...prev, {
              endpoint,
              status: 'success',
              count: data.results.length,
              restaurants: data.results.slice(0, 3)
            }]);
            return; // Exit on first successful endpoint
          }
        } else {
          console.log(`❌ [${i + 1}] FAILED:`, response.status, response.statusText);
        }
      } catch (error) {
        console.log(`❌ [${i + 1}] ERROR:`, error);
      }
    }

    console.log('❌ All API endpoints failed or returned no data');
  };

  return null; // This is just for testing, no UI needed
};

export default ApiEndpointTester;
