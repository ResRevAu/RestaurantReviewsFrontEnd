"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

interface GoogleOAuthProviderWrapperProps {
  children: ReactNode;
}

/**
 * Google OAuth Provider Wrapper
 * Always renders the provider to prevent removeChild errors
 * The provider handles empty clientId gracefully - it just won't work, but won't error
 */
export default function GoogleOAuthProviderWrapper({ children }: GoogleOAuthProviderWrapperProps) {
  // Get client ID at render time (only available client-side)
  // Always render provider consistently to prevent React from trying to remove nodes
  const googleClientId = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '') 
    : '';

  // Always render provider to maintain consistent DOM structure
  // This prevents the removeChild error when components unmount
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
