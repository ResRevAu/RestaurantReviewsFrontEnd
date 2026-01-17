# Social Auth Implementation Summary

## ✅ Implementation Complete

Facebook and Google OAuth login have been successfully implemented in the signup flow.

---

## 📁 Files Created/Modified

### Created Files:
1. **`src/services/socialAuth.ts`**
   - `authenticateWithFacebook()` - Handles Facebook OAuth
   - `authenticateWithGoogle()` - Handles Google OAuth
   - `storeAuthData()` - Stores JWT tokens and user data

2. **`.env.example`**
   - Template for environment variables

### Modified Files:
1. **`src/app/layout.tsx`**
   - Wrapped app with `GoogleOAuthProvider`

2. **`src/app/signup/page.tsx`**
   - Updated `handleSocialLogin()` to call backend APIs
   - Added token storage and user data handling
   - Added error handling

3. **`src/components/signup/Step1UserDetails.tsx`**
   - Integrated `FacebookLogin` component
   - Integrated `useGoogleLogin` hook
   - Added loading states
   - Updated button styling

---

## 🔧 Environment Variables Required

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_API_BASE_URL=https://restaurantreviews.io
```

**Note**: `FACEBOOK_APP_SECRET` and `GOOGLE_CLIENT_SECRET` are only used on the backend. The frontend only needs the public IDs.

---

## 🔄 How It Works

### Facebook Login Flow:
1. User clicks "Continue with Facebook" button
2. Facebook OAuth popup opens
3. User authorizes the app
4. Facebook returns `access_token`
5. Frontend sends `access_token` to backend: `POST /api/auth/social/facebook/`
6. Backend validates token, creates/retrieves user, returns JWT tokens
7. Frontend stores tokens and user data in localStorage
8. User proceeds to Step 2 (Restaurant Selection)

### Google Login Flow:
1. User clicks "Continue with Google" button
2. Google OAuth popup opens
3. User authorizes the app
4. Google returns `access_token`
5. Frontend sends `access_token` to backend: `POST /api/auth/social/google/`
6. Backend validates token, creates/retrieves user, returns JWT tokens
7. Frontend stores tokens and user data in localStorage
8. User proceeds to Step 2 (Restaurant Selection)

---

## 🔌 Backend API Endpoints Required

Your backend must implement these endpoints:

### Facebook OAuth:
```
POST /api/auth/social/facebook/
Content-Type: application/json

{
  "access_token": "facebook_access_token",
  "user_type": "OWNER"
}

Response:
{
  "status": "success",
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": 124,
    "username": "john_doe_fb",
    "email": "john@facebook.com",
    "is_email_verified": true,
    "user_type": "OWNER",
    "social_provider": "facebook"
  },
  "registration_complete": false,
  "next_step": "restaurant_selection",
  "requires_steps_2_and_3": true
}
```

### Google OAuth:
```
POST /api/auth/social/google/
Content-Type: application/json

{
  "id_token": "google_access_token_or_id_token",
  "user_type": "OWNER"
}

Response: Same structure as Facebook
```

**Note**: The frontend currently sends `access_token` as `id_token` parameter. Your backend should:
- Accept `access_token` and validate it with Google
- Or exchange `access_token` for user info
- Or modify frontend to use Google's ID token flow

---

## 🎨 UI Features

- **Facebook Button**: Blue background (#1877F2) with white Facebook icon
- **Google Button**: White background with colored Google icon
- **Loading States**: Buttons show "Connecting..." during OAuth flow
- **Error Handling**: Displays error messages if OAuth fails
- **Disabled States**: Buttons disabled during loading

---

## 🧪 Testing Checklist

- [ ] Add environment variables to `.env.local`
- [ ] Restart development server
- [ ] Test Facebook login button
- [ ] Test Google login button
- [ ] Verify tokens are stored in localStorage
- [ ] Verify user proceeds to Step 2 after OAuth
- [ ] Test error handling (invalid credentials, network errors)
- [ ] Test loading states

---

## 🐛 Troubleshooting

### Facebook Login Issues:
- **"App ID not found"**: Check `NEXT_PUBLIC_FACEBOOK_APP_ID` in `.env.local`
- **"Redirect URI mismatch"**: Ensure Facebook app has correct redirect URIs configured
- **"Invalid OAuth access token"**: Backend needs to validate token with Facebook API

### Google Login Issues:
- **"Client ID not found"**: Check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local`
- **"Redirect URI mismatch"**: Ensure Google OAuth client has correct redirect URIs
- **"Invalid token"**: Backend needs to validate token with Google API

### General Issues:
- **Environment variables not loading**: Restart dev server after adding `.env.local`
- **CORS errors**: Ensure backend allows requests from your frontend domain
- **Network errors**: Check `NEXT_PUBLIC_API_BASE_URL` is correct

---

## 📝 Next Steps

1. **Backend Implementation**: Ensure backend endpoints are implemented and working
2. **Token Validation**: Backend should validate OAuth tokens with providers
3. **User Creation**: Backend should create user accounts if they don't exist
4. **JWT Generation**: Backend should generate and return JWT tokens
5. **Testing**: Test complete flow from OAuth to Step 2

---

## 🔒 Security Notes

1. **Never expose secrets**: `FACEBOOK_APP_SECRET` and `GOOGLE_CLIENT_SECRET` should only be used on backend
2. **Token validation**: Always validate OAuth tokens server-side
3. **HTTPS**: Use HTTPS in production for OAuth flows
4. **CSRF protection**: Implement CSRF protection for OAuth callbacks

---

## 📚 Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Google Identity Services](https://developers.google.com/identity)
- [react-facebook-login](https://www.npmjs.com/package/react-facebook-login)
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
