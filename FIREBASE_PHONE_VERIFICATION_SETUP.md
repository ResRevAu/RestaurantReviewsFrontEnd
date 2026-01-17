# Firebase Phone Verification Setup Guide

## ✅ Implementation Complete

Firebase Phone Authentication has been successfully integrated into the registration flow.

---

## 📁 Files Created/Modified

### Created Files:
1. **`src/config/firebase.ts`**
   - Firebase configuration and initialization
   - Exports `auth` instance for use across the app

2. **`src/services/phoneVerification.ts`**
   - `initializeRecaptcha()` - Initializes Firebase reCAPTCHA
   - `sendVerificationCode()` - Sends SMS verification code to phone
   - `verifyCode()` - Verifies the code entered by user
   - `clearRecaptcha()` - Cleans up reCAPTCHA instance

### Modified Files:
1. **`src/components/signup/Step1UserDetails.tsx`**
   - Added phone verification UI
   - Added verification state management
   - Integrated Firebase phone verification flow
   - Added "Verify" button and code input UI

2. **`src/app/signup/page.tsx`**
   - Added `phoneVerified` state tracking
   - Updated Step 1 validation to require phone verification
   - Added `onPhoneVerified` callback to Step1UserDetails

3. **`package.json`**
   - Added `firebase` dependency

---

## 🔧 Environment Variables Required

Add these to your `.env.local` file (optional - defaults are already set in code):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBRRf6zNMiVQuht_vspix4BQzzAa59L3eE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=restaurant-reviews-d2dd7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=restaurant-reviews-d2dd7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=restaurant-reviews-d2dd7.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=155149849939
NEXT_PUBLIC_FIREBASE_APP_ID=1:155149849939:web:0067d8ad05fc71e9b8fda6
```

**Note**: The Firebase config values are already hardcoded in `src/config/firebase.ts` with fallbacks. You can override them with environment variables if needed.

---

## 🔄 How It Works

### Phone Verification Flow:
1. User enters mobile number (must include country code, e.g., +61 412 345 678)
2. User clicks "Verify" button
3. Firebase reCAPTCHA is initialized (invisible)
4. SMS verification code is sent to the phone number
5. User enters the 6-digit code received via SMS
6. User clicks "Confirm" to verify the code
7. If successful, phone number is marked as verified (green checkmark)
8. User can proceed to Step 2 only after phone is verified

### Validation:
- Mobile number is required
- Phone verification is required before proceeding to Step 2
- If user changes phone number after verification, verification resets
- Error messages are displayed for invalid codes, expired codes, etc.

---

## 📋 Firebase Console Setup Checklist

- [x] Firebase project created: `restaurant-reviews-d2dd7`
- [ ] Phone Authentication enabled in Firebase Console
  - Go to: Authentication → Sign-in method → Phone → Enable
- [ ] Authorized domains added
  - Go to: Authentication → Settings → Authorized domains
  - Add: `localhost` (for development)
  - Add: Your production domain (e.g., `restaurantreviews.io`)
- [ ] (Optional) Test phone numbers configured
  - Go to: Authentication → Sign-in method → Phone → Phone numbers for testing
  - Add test numbers to avoid SMS charges during development

---

## 🧪 Testing

### Test Phone Numbers (Firebase Console):
1. Go to Firebase Console → Authentication → Sign-in method → Phone
2. Click "Phone numbers for testing"
3. Add test numbers:
   - Phone: `+1234567890`
   - Code: `123456`
4. Use these during development to avoid SMS charges

### Testing Checklist:
- [ ] User can enter phone number with country code
- [ ] "Verify" button sends SMS code
- [ ] reCAPTCHA challenge appears if needed
- [ ] User receives SMS code
- [ ] User can enter 6-digit code
- [ ] Code verification works correctly
- [ ] Verified phone shows green checkmark
- [ ] User cannot proceed to Step 2 without verification
- [ ] Changing phone number resets verification
- [ ] Error messages display correctly for invalid/expired codes
- [ ] "Resend code" button works

---

## ⚠️ Important Notes

1. **Phone Number Format**: 
   - Must include country code with `+` prefix
   - Example: `+61 412 345 678` (Australia)
   - Example: `+1 555 123 4567` (USA)

2. **reCAPTCHA**:
   - Uses invisible reCAPTCHA v3
   - May show challenge popup occasionally
   - Required by Firebase for spam prevention

3. **SMS Costs**:
   - Firebase Phone Auth has free tier limits
   - Use test phone numbers during development
   - Check Firebase pricing for production usage

4. **Error Handling**:
   - Invalid phone number format
   - Too many requests (rate limiting)
   - Invalid/expired verification codes
   - reCAPTCHA failures
   - SMS quota exceeded

5. **Social Login**:
   - Phone verification is skipped for social login users
   - Social login users proceed directly to Step 2

---

## 🐛 Troubleshooting

### Issue: "reCAPTCHA verification failed"
- **Solution**: Clear browser cache and try again
- Check that authorized domains are configured correctly

### Issue: "Invalid phone number format"
- **Solution**: Ensure phone number includes country code with `+` prefix
- Example: `+61 412 345 678` not `0412 345 678`

### Issue: "Too many requests"
- **Solution**: Wait a few minutes before trying again
- Use test phone numbers during development

### Issue: "SMS quota exceeded"
- **Solution**: Check Firebase Console for quota limits
- Use test phone numbers for development
- Consider upgrading Firebase plan for production

### Issue: Code not received
- **Solution**: Check phone number is correct
- Wait a few seconds (SMS can take time)
- Use "Resend code" button
- Check spam folder
- Verify Firebase Phone Auth is enabled in console

---

## 📚 Resources

- [Firebase Phone Authentication Docs](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase reCAPTCHA Setup](https://firebase.google.com/docs/auth/web/phone-auth#recaptcha-setup)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

## ✅ Next Steps

1. **Enable Phone Authentication in Firebase Console**:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Phone provider
   - Configure authorized domains

2. **Test the Implementation**:
   - Use test phone numbers during development
   - Verify the complete flow works end-to-end

3. **Production Deployment**:
   - Add production domain to authorized domains
   - Monitor SMS usage and costs
   - Set up Firebase quotas/alerts if needed

---

**Status**: ✅ Implementation Complete - Ready for Testing
