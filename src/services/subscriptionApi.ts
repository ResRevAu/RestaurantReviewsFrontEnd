// Subscription Plans API service
export interface PlanFeature {
  id: number;
  name: string;
  description: string;
}

export interface PricingOption {
  id: number;
  billing_cycle: string;
  billing_cycle_display: string;
  price: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  plan_type: "Restaurant Owner" | "Customer";
  plan_type_display?: string;
  pricing_options: PricingOption[];
  features?: PlanFeature[];
}

const getApiBaseUrl = () => {
  // Use environment variable if set, otherwise default to production server
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://restaurantreviews.io';
};

export interface FetchPlansParams {
  plan_type?: "Restaurant Owner" | "Customer";
}

/**
 * Fetch subscription plans from the API
 * @param params - Optional parameters to filter plans
 * @returns Array of subscription plans or null if error
 */
export const fetchSubscriptionPlans = async (
  params?: FetchPlansParams
): Promise<SubscriptionPlan[] | null> => {
  try {
    const baseUrl = getApiBaseUrl();
    const searchParams = new URLSearchParams();
    
    if (params?.plan_type) {
      searchParams.set('plan_type', params.plan_type);
    }
    
    const url = `${baseUrl}/api/subscriptions/plans/public/?${searchParams.toString()}`;
    
    console.log('🌐 Fetching subscription plans from API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
    console.log('📡 Subscription Plans API Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.error('❌ Subscription Plans API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    console.log('📦 Raw API response data:', JSON.stringify(data, null, 2));
    
    // Handle paginated response
    if (data.results && Array.isArray(data.results)) {
      console.log('✅ Fetched', data.results.length, 'subscription plans (paginated)');
      console.log('📋 Plans data:', data.results.map((p: any) => ({
        id: p.id,
        name: p.name,
        billing_cycle: p.billing_cycle,
        plan_type: p.plan_type,
        price: p.price
      })));
      return data.results;
    }
    
    // Handle direct array response
    if (Array.isArray(data)) {
      console.log('✅ Fetched', data.length, 'subscription plans (direct array)');
      console.log('📋 Plans data:', data.map((p: any) => ({
        id: p.id,
        name: p.name,
        billing_cycle: p.billing_cycle,
        plan_type: p.plan_type,
        price: p.price
      })));
      return data;
    }
    
    console.warn('⚠️ Unexpected API response format:', data);
    return null;
  } catch (error) {
    console.error('❌ Subscription Plans API fetch error:', error);
    return null;
  }
};

/**
 * Fetch a specific subscription plan by ID
 * @param planId - The ID of the plan to fetch
 * @returns The subscription plan or null if error
 */
export const fetchSubscriptionPlanById = async (
  planId: number
): Promise<SubscriptionPlan | null> => {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/subscriptions/plans/public/${planId}/`;
    
    console.log('🌐 Fetching subscription plan by ID from API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
    console.log('📡 Subscription Plan API Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.error('❌ Subscription Plan API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log('✅ Fetched subscription plan:', data.name);
    return data;
  } catch (error) {
    console.error('❌ Subscription Plan API fetch error:', error);
    return null;
  }
};

