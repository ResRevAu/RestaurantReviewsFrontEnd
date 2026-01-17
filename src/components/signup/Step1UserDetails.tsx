"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Input from "@/shared/Input";
import { 
  sendVerificationCode, 
  verifyCode, 
  initializeRecaptcha, 
  clearRecaptcha 
} from '@/services/phoneVerification';
import type { ConfirmationResult } from 'firebase/auth';
import { UserIcon, PhoneIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
// Social login imports - DISABLED FOR NOW
// Uncomment below to re-enable social login
// import FacebookLogin from 'react-facebook-login';
// import { useGoogleLogin } from '@react-oauth/google';
// import facebookWhiteSvg from "@/images/FacebookWhite.svg";
// import googleSvg from "@/images/Google.svg";

interface Step1UserDetailsProps {
  formData: {
    first_name: string;
    last_name: string;
    phone_number: string;
    username: string;
    email: string;
    password: string;
    confirm_password: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSocialLogin: (provider: string, token?: string, idToken?: string) => void;
  socialLoginUsed: boolean;
  loginSocials: Array<{ name: string; href: string; icon: any }>;
  loading?: boolean;
  errors?: { [field: string]: string };
  onPhoneVerified?: (verified: boolean) => void;
}

const Step1UserDetails: React.FC<Step1UserDetailsProps> = ({
  formData,
  handleChange,
  handleSocialLogin,
  socialLoginUsed,
  loginSocials,
  loading = false,
  errors = {},
  onPhoneVerified,
}) => {
  // Phone verification state
  const [phoneVerificationStep, setPhoneVerificationStep] = useState<'none' | 'code-sent' | 'verified'>('none');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [phoneValidationError, setPhoneValidationError] = useState<string>('');
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Cleanup reCAPTCHA when component unmounts
  useEffect(() => {
    return () => {
      clearRecaptcha();
      // Also clear the container element safely
      try {
        if (recaptchaContainerRef.current) {
          recaptchaContainerRef.current.innerHTML = '';
        }
        // Also clear the container by ID in case ref is null
        const container = document.getElementById('recaptcha-container');
        if (container) {
          container.innerHTML = '';
        }
      } catch (error) {
        // Ignore errors when cleaning up
        console.warn('Error cleaning up reCAPTCHA:', error);
      }
    };
  }, []);

  // Phone number validation functions
  const validatePhoneNumber = (phone: string): { isValid: boolean; country?: string; error?: string } => {
    const cleanPhone = phone.replace(/\s/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
    
    // Australia: +61 or 61 followed by 9 digits (mobile starts with 4)
    const auRegex = /^(\+?61|0)?[4-5]\d{8}$/;
    if (auRegex.test(cleanPhone)) {
      // Normalize to +61 format
      const normalized = cleanPhone.startsWith('0') 
        ? '+61' + cleanPhone.substring(1)
        : cleanPhone.startsWith('61')
        ? '+' + cleanPhone
        : cleanPhone.startsWith('+61')
        ? cleanPhone
        : '+61' + cleanPhone;
      
      if (/^\+61[4-5]\d{8}$/.test(normalized)) {
        return { isValid: true, country: 'AU' };
      }
    }
    
    // New Zealand: +64 or 64 followed by 9 digits (mobile starts with 2)
    const nzRegex = /^(\+?64|0)?[2]\d{8,9}$/;
    if (nzRegex.test(cleanPhone)) {
      const normalized = cleanPhone.startsWith('0') 
        ? '+64' + cleanPhone.substring(1)
        : cleanPhone.startsWith('64')
        ? '+' + cleanPhone
        : cleanPhone.startsWith('+64')
        ? cleanPhone
        : '+64' + cleanPhone;
      
      if (/^\+64[2]\d{8,9}$/.test(normalized)) {
        return { isValid: true, country: 'NZ' };
      }
    }
    
    // India: +91 or 91 followed by 10 digits (mobile starts with 6-9)
    const inRegex = /^(\+?91|0)?[6-9]\d{9}$/;
    if (inRegex.test(cleanPhone)) {
      const normalized = cleanPhone.startsWith('0') 
        ? '+91' + cleanPhone.substring(1)
        : cleanPhone.startsWith('91')
        ? '+' + cleanPhone
        : cleanPhone.startsWith('+91')
        ? cleanPhone
        : '+91' + cleanPhone;
      
      if (/^\+91[6-9]\d{9}$/.test(normalized)) {
        return { isValid: true, country: 'IN' };
      }
    }
    
    return { 
      isValid: false, 
      error: 'Please enter a valid phone number from Australia (+61), New Zealand (+64), or India (+91). Examples: +61412345678, +6421234567, +919795154071' 
    };
  };

  // Handle sending verification code
  const handleSendVerificationCode = async () => {
    if (!formData.phone_number) {
      alert('Please enter your mobile number first.');
      return;
    }

    // Validate phone number for AU, NZ, or India
    const validation = validatePhoneNumber(formData.phone_number);
    if (!validation.isValid) {
      alert(validation.error || 'Please enter a valid phone number.');
      return;
    }
    
    // Normalize phone number
    const cleanPhone = formData.phone_number.replace(/\s/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
    let normalizedPhone = cleanPhone;
    
    if (validation.country === 'AU') {
      normalizedPhone = cleanPhone.startsWith('0') 
        ? '+61' + cleanPhone.substring(1)
        : cleanPhone.startsWith('61')
        ? '+' + cleanPhone
        : cleanPhone.startsWith('+61')
        ? cleanPhone
        : '+61' + cleanPhone;
    } else if (validation.country === 'NZ') {
      normalizedPhone = cleanPhone.startsWith('0') 
        ? '+64' + cleanPhone.substring(1)
        : cleanPhone.startsWith('64')
        ? '+' + cleanPhone
        : cleanPhone.startsWith('+64')
        ? cleanPhone
        : '+64' + cleanPhone;
    } else if (validation.country === 'IN') {
      normalizedPhone = cleanPhone.startsWith('0') 
        ? '+91' + cleanPhone.substring(1)
        : cleanPhone.startsWith('91')
        ? '+' + cleanPhone
        : cleanPhone.startsWith('+91')
        ? cleanPhone
        : '+91' + cleanPhone;
    }

    try {
      setVerifying(true);
      console.log('🔄 Starting phone verification process...');
      const result = await sendVerificationCode(normalizedPhone, 'recaptcha-container');
      setConfirmationResult(result);
      setPhoneVerificationStep('code-sent');
      // Show success message
      alert('✅ Verification code sent! Please check your SMS messages. The code may take a few moments to arrive.');
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to send verification code. Please try again.';
      alert(`❌ ${errorMessage}`);
      // Reset state on error
      setPhoneVerificationStep('none');
      setConfirmationResult(null);
      if (onPhoneVerified) {
        onPhoneVerified(false);
      }
    } finally {
      setVerifying(false);
    }
  };

  // Handle verifying code
  const handleVerifyCode = async () => {
    if (!confirmationResult || !verificationCode) {
      alert('Please enter the verification code.');
      return;
    }

    if (verificationCode.length !== 6) {
      alert('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setVerifying(true);
      console.log('🔍 Verifying code...');
      await verifyCode(confirmationResult, verificationCode);
      setPhoneVerificationStep('verified');
      if (onPhoneVerified) {
        onPhoneVerified(true);
      }
      alert('✅ Phone number verified successfully!');
    } catch (error: any) {
      console.error('Error verifying code:', error);
      const errorMessage = error.message || 'Failed to verify code. Please check the code and try again.';
      alert(`❌ ${errorMessage}`);
      // Clear the code input on error so user can retry
      setVerificationCode('');
    } finally {
      setVerifying(false);
    }
  };

  // Social login state - DISABLED FOR NOW
  // Uncomment below to re-enable social login
  // const [facebookLoading, setFacebookLoading] = useState(false);
  // const [googleLoading, setGoogleLoading] = useState(false);
  // const [isGoogleReady, setIsGoogleReady] = useState(false);

  // Check if Google OAuth is available (client-side only) - DISABLED FOR NOW
  // useEffect(() => {
  //   const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  //   if (googleClientId && typeof window !== 'undefined') {
  //     setIsGoogleReady(true);
  //   }
  // }, []);

  // SOCIAL LOGIN DISABLED - Uncomment below to re-enable
  // Google OAuth login hook - DISABLED FOR NOW
  // const googleLogin = useGoogleLogin({
  //   onSuccess: async (tokenResponse) => {
  //     try {
  //       setGoogleLoading(true);
  //       await handleSocialLogin('google', undefined, tokenResponse.access_token);
  //     } catch (error) {
  //       console.error('Google login error:', error);
  //       setGoogleLoading(false);
  //     }
  //   },
  //   onError: (error) => {
  //     console.error('Google login error:', error);
  //     setGoogleLoading(false);
  //   },
  // });

  // Wrapper function to safely call Google login - DISABLED FOR NOW
  // const handleGoogleLoginClick = () => {
  //   try {
  //     if (isGoogleReady && typeof window !== 'undefined') {
  //       googleLogin();
  //     } else {
  //       console.warn('Google OAuth is not ready yet');
  //     }
  //   } catch (error) {
  //     console.error('Error calling Google login:', error);
  //     setGoogleLoading(false);
  //   }
  // };

  // Facebook login response handler - DISABLED FOR NOW
  // const handleFacebookResponse = (response: any) => {
  //   if (response.accessToken) {
  //     setFacebookLoading(true);
  //     handleSocialLogin('facebook', response.accessToken);
  //   }
  // };

  // Facebook login failure handler - DISABLED FOR NOW
  // const handleFacebookFailure = (error: any) => {
  //   console.error('Facebook login error:', error);
  //   setFacebookLoading(false);
  // };
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          User Details
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Complete your profile information
        </p>
      </div>

      {/* Social Login Options - DISABLED FOR NOW */}
      {/* Uncomment the code below to re-enable social login */}
      {/* 
      {false && !socialLoginUsed && (
        <>
          <div className="grid gap-3 sm:gap-4">
            <FacebookLogin
              appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''}
              autoLoad={false}
              fields="name,email,picture"
              callback={handleFacebookResponse}
              onFailure={handleFacebookFailure}
              cssClass="w-full"
              buttonStyle={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '2px solid #1877F2',
                backgroundColor: loading || facebookLoading ? '#166FE5' : '#1877F2',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading || facebookLoading ? 'not-allowed' : 'pointer',
                opacity: loading || facebookLoading ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
              icon={<Image src={facebookWhiteSvg} alt="Facebook" className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />}
              textButton={facebookLoading ? 'Connecting...' : 'Continue with Facebook'}
              disabled={loading || facebookLoading}
            />

            {isGoogleReady ? (
              <button
                onClick={handleGoogleLoginClick}
                disabled={loading || googleLoading}
                className="nc-will-change-transform flex items-center justify-center w-full rounded-xl border-2 px-4 py-3.5 sm:py-4 transform transition-all duration-200 font-medium text-sm sm:text-base bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-sm hover:scale-[1.02] hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image
                  className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 mr-3"
                  src={googleSvg}
                  alt="Google"
                />
                <span className="flex-grow text-center font-semibold">
                  {googleLoading ? 'Connecting...' : 'Continue with Google'}
                </span>
              </button>
            ) : (
              <button
                disabled
                className="nc-will-change-transform flex items-center justify-center w-full rounded-xl border-2 px-4 py-3.5 sm:py-4 transform transition-all duration-200 font-medium text-sm sm:text-base bg-white text-gray-400 border-gray-300 shadow-sm opacity-50 cursor-not-allowed"
              >
                <Image
                  className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 mr-3"
                  src={googleSvg}
                  alt="Google"
                />
                <span className="flex-grow text-center font-semibold">
                  Continue with Google
                </span>
              </button>
            )}
          </div>

          <div className="relative text-center my-6">
            <span className="relative z-10 inline-block px-4 font-medium text-sm text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800">
              OR
            </span>
            <div className="absolute left-0 w-full top-1/2 transform -translate-y-1/2 border-t border-neutral-200 dark:border-neutral-700"></div>
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-2">
            Enter User Details Manually
          </p>
        </>
      )}
      */}

      {/* Personal Info Section */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
              First Name <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              <Input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter First name"
                className={`mt-0 pl-10 ${
                  errors.first_name 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : formData.first_name.trim()
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
            )}
          </label>

          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
              Last Name <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              <Input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter Last name"
                className={`mt-0 pl-10 ${
                  errors.last_name 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : formData.last_name.trim()
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-gray-300'
                }`}
              />
            </div>
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
            )}
          </label>
        </div>

        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
            Mobile Number <span className="text-red-500">*</span>
            {phoneVerificationStep === 'verified' && (
              <span className="ml-2 text-green-600 dark:text-green-400 text-xs font-normal">
                ✓ Verified
              </span>
            )}
          </span>
          <div className="flex gap-2 items-start">
            <div className="flex-1 relative">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 z-10" />
              <Input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={(e) => {
                  // Filter out alphabets and only allow numbers, +, spaces, dashes, and parentheses
                  const inputValue = e.target.value;
                  // Allow only: digits, +, spaces, dashes, parentheses
                  const filteredValue = inputValue.replace(/[^\d+\s\-()]/g, '');
                  
                  // Create a new event with filtered value
                  const syntheticEvent = {
                    ...e,
                    target: {
                      ...e.target,
                      value: filteredValue,
                      name: e.target.name,
                    },
                  } as React.ChangeEvent<HTMLInputElement>;
                  
                  handleChange(syntheticEvent);
                  
                  // Validate phone number in real-time
                  if (filteredValue.trim()) {
                    const validation = validatePhoneNumber(filteredValue);
                    if (!validation.isValid) {
                      setPhoneValidationError(validation.error || 'Invalid phone number format');
                    } else {
                      setPhoneValidationError('');
                    }
                  } else {
                    setPhoneValidationError('');
                  }
                  
                  // Reset verification if phone number changes
                  if (phoneVerificationStep !== 'none') {
                    setPhoneVerificationStep('none');
                    setVerificationCode('');
                    setConfirmationResult(null);
                    if (onPhoneVerified) {
                      onPhoneVerified(false);
                    }
                  }
                }}
                placeholder="+61 412 345 678, +64 21 234 567, +91 97951 54071"
                className={`mt-0 pl-10 ${
                  errors.phone_number || phoneValidationError 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : phoneVerificationStep === 'verified'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500 focus:border-green-500 focus:ring-green-500/20'
                    : formData.phone_number.trim() && !phoneValidationError
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-gray-300'
                }`}
                required
                disabled={phoneVerificationStep === 'verified'}
              />
            </div>
            <button
              type="button"
              onClick={handleSendVerificationCode}
              disabled={!formData.phone_number || verifying || loading || !!phoneValidationError}
              className="px-4 py-2 h-11 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0"
              style={{ 
                minWidth: '80px',
                backgroundColor: (!formData.phone_number || verifying || loading || !!phoneValidationError)
                  ? undefined
                  : '#2563eb', // primary-600 blue
                color: (!formData.phone_number || verifying || loading || !!phoneValidationError)
                  ? undefined
                  : '#ffffff', // white text
                cursor: (!formData.phone_number || verifying || loading || !!phoneValidationError)
                  ? 'not-allowed'
                  : 'pointer',
                opacity: (!formData.phone_number || verifying || loading || !!phoneValidationError) ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!(!formData.phone_number || verifying || loading || !!phoneValidationError)) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8'; // primary-700
                }
              }}
              onMouseLeave={(e) => {
                if (!(!formData.phone_number || verifying || loading || !!phoneValidationError)) {
                  e.currentTarget.style.backgroundColor = '#2563eb'; // primary-600
                }
              }}
            >
              {verifying ? 'Sending...' : 'Verify'}
            </button>
          </div>
          {(errors.phone_number || phoneValidationError) && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {phoneValidationError || errors.phone_number}
            </p>
          )}
          {!errors.phone_number && !phoneValidationError && formData.phone_number.trim() && phoneVerificationStep !== 'verified' && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Mobile or landline accepted (leading 0 is optional)
            </p>
          )}
          {phoneVerificationStep === 'verified' && (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <span>✓</span> Phone number verified successfully
            </p>
          )}
          
          {/* Verification Code Input */}
          {phoneVerificationStep === 'code-sent' && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                Enter the verification code sent to your phone
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only numbers
                    setVerificationCode(value);
                  }}
                  placeholder="Enter 6-digit code"
                  className="flex-1"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={!verificationCode || verificationCode.length !== 6 || verifying}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap transition-colors"
                >
                  {verifying ? 'Verifying...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneVerificationStep('none');
                    setVerificationCode('');
                    setConfirmationResult(null);
                    if (onPhoneVerified) {
                      onPhoneVerified(false);
                    }
                  }}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 text-sm font-medium whitespace-nowrap transition-colors"
                >
                  Cancel
                </button>
              </div>
              <button
                type="button"
                onClick={handleSendVerificationCode}
                disabled={verifying}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          )}
          
          {/* reCAPTCHA Container (hidden, required by Firebase) */}
          <div id="recaptcha-container" ref={recaptchaContainerRef} className="hidden"></div>
        </label>
      </div>

      {/* Account Details Section */}
      <div className="space-y-5 pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          Account Details
        </h3>

        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
            Username <span className="text-red-500">*</span>
          </span>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className={`mt-0 pl-10 ${
                errors.username 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : formData.username.trim() && formData.username.length >= 3
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                  : 'border-gray-300'
              }`}
              required
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
          )}
          {!errors.username && formData.username && formData.username.length < 3 && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Username must be at least 3 characters long
            </p>
          )}
        </label>

        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
            Email address <span className="text-red-500">*</span>
          </span>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@example.com"
              className={`mt-0 pl-10 ${
                errors.email 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : formData.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                  : 'border-gray-300'
              }`}
              required
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </label>

        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
            Password <span className="text-red-500">*</span>
          </span>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className={`mt-0 pl-10 ${
                errors.password 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : formData.password.trim() && formData.password.length >= 8
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                  : 'border-gray-300'
              }`}
              required
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
          )}
          {!errors.password && formData.password && formData.password.length < 8 && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Password must be at least 8 characters long
            </p>
          )}
        </label>

        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200 text-sm font-medium mb-1.5 block">
            Confirm Password <span className="text-red-500">*</span>
          </span>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
            <Input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirm password"
              className={`mt-0 pl-10 ${
                errors.confirm_password 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                  : formData.confirm_password.trim() && formData.password === formData.confirm_password && formData.password.length >= 8
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                  : 'border-gray-300'
              }`}
              required
            />
          </div>
          {errors.confirm_password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirm_password}</p>
          )}
          {!errors.confirm_password && formData.confirm_password && formData.password !== formData.confirm_password && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">
              Passwords do not match
            </p>
          )}
        </label>
      </div>
    </div>
  );
};

export default Step1UserDetails;
