const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://restaurantreviews.io';
};

export interface SocialAuthResponse {
  status: string;
  user_id: number;
  access?: string; // Optional - only returned after Step 2 completion
  refresh?: string; // Optional - only returned after Step 2 completion
  user: {
    id: number;
    username: string;
    email: string;
    is_email_verified: boolean;
    user_type: string;
    social_provider?: string;
  };
  registration_complete: boolean;
  next_step: string;
  requires_step_2: boolean; // Updated: Only Step 2 required now
  message?: string;
}

/**
 * Authenticate with Facebook
 */
export const authenticateWithFacebook = async (
  accessToken: string,
  userType: string = 'OWNER'
): Promise<SocialAuthResponse> => {
  const baseUrl = getApiBaseUrl();
  
  const response = await fetch(`${baseUrl}/api/auth/social/facebook/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      access_token: accessToken,
      user_type: userType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Facebook authentication failed: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Authenticate with Google
 */
export const authenticateWithGoogle = async (
  idToken: string,
  userType: string = 'OWNER'
): Promise<SocialAuthResponse> => {
  const baseUrl = getApiBaseUrl();
  
  const response = await fetch(`${baseUrl}/api/auth/social/google/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      id_token: idToken,
      user_type: userType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Google authentication failed: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Store authentication tokens and user data
 */
export const storeAuthData = (response: SocialAuthResponse) => {
  if (response.access) {
    localStorage.setItem('access_token', response.access);
  }
  if (response.refresh) {
    localStorage.setItem('refresh_token', response.refresh);
  }
  localStorage.setItem('user', JSON.stringify(response.user));
  
  // Dispatch event to notify other components
  window.dispatchEvent(new Event('authStateChange'));
};
