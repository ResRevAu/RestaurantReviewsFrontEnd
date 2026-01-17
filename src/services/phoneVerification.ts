import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult,
  PhoneAuthProvider,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initialize reCAPTCHA verifier
 * Must be called before sending verification code
 */
export const initializeRecaptcha = (containerId: string = 'recaptcha-container'): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Clear existing verifier if any
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (clearError) {
          console.warn('Error clearing existing reCAPTCHA:', clearError);
        }
        recaptchaVerifier = null;
      }

      // Clear the container element to remove any existing widgets
      if (typeof window !== 'undefined') {
        const container = document.getElementById(containerId);
        if (container) {
          try {
            // Remove all child elements to clear any existing reCAPTCHA widgets
            container.innerHTML = '';
          } catch (e) {
            console.warn('Error clearing container:', e);
          }
        } else {
          // Container doesn't exist, create it
          const newContainer = document.createElement('div');
          newContainer.id = containerId;
          newContainer.className = 'hidden';
          document.body.appendChild(newContainer);
        }
      }

      recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible', // Use invisible reCAPTCHA
        callback: () => {
          resolve();
        },
        'expired-callback': () => {
          reject(new Error('reCAPTCHA expired. Please try again.'));
        }
      });

      recaptchaVerifier.render().then(() => {
        resolve();
      }).catch((renderError: any) => {
        // Handle "already rendered" error specifically
        if (renderError.message && renderError.message.includes('already been rendered')) {
          console.warn('reCAPTCHA already rendered, clearing and retrying...');
          // Clear and retry once
          if (recaptchaVerifier) {
            try {
              recaptchaVerifier.clear();
            } catch (e) {
              // Ignore clear errors
            }
            recaptchaVerifier = null;
          }
          // Clear container and retry
          if (typeof window !== 'undefined') {
            const container = document.getElementById(containerId);
            if (container) {
              container.innerHTML = '';
            }
          }
          reject(new Error('reCAPTCHA initialization failed. Please refresh the page and try again.'));
        } else {
          reject(renderError);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Send verification code to phone number
 */
export const sendVerificationCode = async (
  phoneNumber: string,
  containerId?: string
): Promise<ConfirmationResult> => {
  // Format phone number (ensure it includes country code, e.g., +1234567890)
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  
  try {
    console.log('📱 Attempting to send SMS to:', formattedPhone);

    // Always re-initialize reCAPTCHA to ensure clean state
    // This prevents "already rendered" errors from previous attempts
    console.log('🔐 Initializing reCAPTCHA...');
    await initializeRecaptcha(containerId);

    if (!recaptchaVerifier) {
      throw new Error('reCAPTCHA verifier not initialized');
    }

    // Send verification code
    console.log('📤 Sending verification code via Firebase...');
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    
    console.log('✅ SMS sent successfully! Verification code should arrive shortly.');
    return confirmationResult;
  } catch (error: any) {
    console.error('❌ Error sending verification code:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Phone number attempted:', formattedPhone);
    
    // Clear verifier on error
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (clearError) {
        console.warn('Error clearing verifier:', clearError);
      }
      recaptchaVerifier = null;
    }

    // Handle reCAPTCHA rendering errors FIRST (before other checks)
    if (error.message && error.message.includes('already been rendered')) {
      throw new Error('reCAPTCHA error: Please refresh the page and try again.');
    }

    // Handle specific Firebase error codes
    if (error.code === 'auth/operation-not-allowed') {
      // Check if it's a region-specific error
      if (error.message && error.message.includes('region enabled')) {
        const countryCode = formattedPhone.startsWith('+91') ? 'India (+91)' :
                           formattedPhone.startsWith('+61') ? 'Australia (+61)' :
                           formattedPhone.startsWith('+64') ? 'New Zealand (+64)' :
                           'this region';
        throw new Error(`SMS verification for ${countryCode} requires additional configuration.\n\nSteps to fix:\n\n1. Enable Phone Authentication:\n   - Go to: https://console.firebase.google.com/project/restaurant-reviews-454400/authentication/providers\n   - Click "Phone"\n   - Toggle "Enable" to ON\n   - Click "Save"\n\n2. For India (+91) specifically:\n   - Firebase may require additional verification for India\n   - Make sure you're on Blaze plan (billing enabled)\n   - Go to: Project Settings → Usage and billing\n   - Ensure billing is set up\n\n3. Alternative - Use Test Phone Numbers (for development):\n   - Go to: Authentication → Sign-in method → Phone\n   - Scroll to "Phone numbers for testing"\n   - Click "Add phone number"\n   - Add: +919795154071 with test code: 123456\n   - This bypasses SMS sending\n\n4. If issue persists:\n   - Contact Firebase Support\n   - Or use a different phone number from an enabled region\n\nAfter configuration, refresh this page and try again.`);
      } else {
        throw new Error('Phone Authentication is not enabled in Firebase Console.\n\nTo enable it:\n1. Go to Firebase Console: https://console.firebase.google.com/\n2. Select your project: restaurant-reviews-454400\n3. Navigate to: Authentication → Sign-in method\n4. Find "Phone" in the list\n5. Click on "Phone"\n6. Toggle "Enable" to ON\n7. Click "Save"\n\nAfter enabling, refresh this page and try again.');
      }
    } else if (error.code === 'auth/billing-not-enabled') {
      throw new Error('Billing not enabled. To send SMS verification codes:\n\nOption 1: Enable billing in Firebase Console\n- Go to: Firebase Console → Project Settings → Usage and billing\n- Click "Modify plan" → "Upgrade to Blaze"\n- Add a billing account\n\nOption 2: Use test phone numbers (for development)\n- Go to: Firebase Console → Authentication → Sign-in method → Phone\n- Scroll to "Phone numbers for testing"\n- Add your number with a test code\n\nNote: New Firebase projects have a 10 SMS/day limit without billing.');
    } else if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format. Please include country code (e.g., +91 for India, +61 for Australia)');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please wait a few minutes before trying again.');
    } else if (error.code === 'auth/captcha-check-failed') {
      throw new Error('reCAPTCHA verification failed. Please refresh the page and try again.');
    } else if (error.code === 'auth/quota-exceeded' || error.message?.includes('quota')) {
      throw new Error('SMS quota exceeded (10 SMS/day limit for new projects). Please:\n1. Add billing account in Firebase Console to increase quota\n2. Or use test phone numbers for development\n3. Or try again tomorrow');
    } else if (error.code === 'auth/missing-phone-number') {
      throw new Error('Phone number is required. Please enter your mobile number.');
    } else if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid verification code. Please check and try again.');
    } else if (error.code === 'auth/session-expired') {
      throw new Error('Session expired. Please request a new verification code.');
    } else if (error.code === 'auth/invalid-app-credential') {
      throw new Error('reCAPTCHA configuration issue. Please configure reCAPTCHA in Firebase Console:\n\n1. Go to Firebase Console:\n   https://console.firebase.google.com/project/restaurant-reviews-454400/settings/general\n\n2. Scroll to "Your apps" section\n3. Click on your Web app (or create one if needed)\n4. Make sure "localhost" is in Authorized domains:\n   - Go to: Authentication → Settings → Authorized domains\n   - Add "localhost" if not present\n\n5. Configure reCAPTCHA:\n   - Go to: Authentication → Settings\n   - Find "reCAPTCHA Enterprise" section\n   - Make sure reCAPTCHA is enabled\n   - Or use reCAPTCHA v2 (which we\'re using)\n\n6. Check API Key restrictions:\n   - Go to: Google Cloud Console → APIs & Services → Credentials\n   - Find your API key: AIzaSyA27DXPBjefOZWm02rVbMcDwE-J457a_S8\n   - Make sure "Application restrictions" allows your domain\n   - For development, you can set it to "None" temporarily\n\n7. Alternative - Use Test Phone Numbers:\n   - Go to: Authentication → Sign-in method → Phone\n   - Add test number: +919795154071 with code: 123456\n   - This bypasses reCAPTCHA issues\n\nAfter configuration, refresh this page and try again.');
    }
    
    // Special handling for India (+91) - only if not a quota/billing/rendering/operation-not-allowed/invalid-app-credential error
    if (formattedPhone.startsWith('+91') && 
        !error.message?.includes('quota') && 
        !error.message?.includes('billing') &&
        !error.message?.includes('already been rendered') &&
        error.code !== 'auth/billing-not-enabled' &&
        error.code !== 'auth/operation-not-allowed' &&
        error.code !== 'auth/invalid-app-credential') {
      throw new Error('SMS delivery to India may be delayed or blocked by carriers. Please check:\n1. Your phone number is correct\n2. Check spam/blocked messages\n3. Wait a few minutes and try "Resend code"\n4. If issue persists, contact support.');
    }
    
    // Generic error message
    throw new Error(error.message || 'Failed to send verification code. Please check your phone number and try again.');
  }
};

/**
 * Verify the code entered by user
 */
export const verifyCode = async (
  confirmationResult: ConfirmationResult,
  code: string
): Promise<boolean> => {
  try {
    await confirmationResult.confirm(code);
    return true;
  } catch (error: any) {
    console.error('Error verifying code:', error);
    
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid verification code. Please try again.');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('Verification code has expired. Please request a new one.');
    } else if (error.code === 'auth/session-expired') {
      throw new Error('Session expired. Please request a new verification code.');
    }
    
    throw new Error(error.message || 'Failed to verify code');
  }
};

/**
 * Clear reCAPTCHA verifier
 */
export const clearRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
};
