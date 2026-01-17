# Social Authentication Setup Guide

This guide will help you set up Facebook, Google, and X (Twitter) OAuth applications for your Restaurant Reviews platform.

---

## Table of Contents

1. [Facebook Setup](#facebook-setup)
2. [Google Setup](#google-setup)
3. [X (Twitter) Setup](#x-twitter-setup)
4. [Environment Variables](#environment-variables)
5. [Backend Configuration](#backend-configuration)
6. [Testing](#testing)

---

## Facebook Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Consumer"** or **"Business"** as app type
4. Fill in:
   - **App Display Name**: Restaurant Reviews (or your app name)
   - **App Contact Email**: your-email@example.com
5. Click **"Create App"**

### Step 2: Add Facebook Login Product

1. In your app dashboard, click **"Add Product"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. Select **"Web"** platform
4. Enter your site URL: `https://restaurantreviews.io` (or your domain)

### Step 3: Configure OAuth Settings

1. Go to **Settings** → **Basic**
2. Note your **App ID** and **App Secret**
3. Add **App Domains**: `restaurantreviews.io` (or your domain)
4. Add **Privacy Policy URL**: `https://restaurantreviews.io/privacy`
5. Add **Terms of Service URL**: `https://restaurantreviews.io/terms`

### Step 4: Configure OAuth Redirect URIs

1. Go to **Facebook Login** → **Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   https://restaurantreviews.io/api/auth/social/facebook/callback
   http://localhost:3000/api/auth/social/facebook/callback (for development)
   ```

### Step 5: Get Credentials

- **App ID**: Found in Settings → Basic
- **App Secret**: Found in Settings → Basic (click "Show" to reveal)
- **API Version**: Usually `v18.0` or latest (check in Settings)

### Step 6: Request Permissions

In **Facebook Login** → **Settings** → **Permissions**, ensure these are requested:
- `email` (required)
- `public_profile` (required)
- `user_location` (optional)

---

## Google Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: **Restaurant Reviews**
4. Click **"Create"**

### Step 2: Enable Google+ API

1. Go to **APIs & Services** → **Library**
2. Search for **"Google+ API"** or **"Google Identity Services"**
3. Click **"Enable"**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - **User Type**: External
   - **App name**: Restaurant Reviews
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
   - **Scopes**: `email`, `profile`, `openid`
   - **Test users**: Add test emails (for development)
4. Click **"Save and Continue"** → **"Back to Dashboard"**

### Step 4: Create OAuth Client ID

1. **Application type**: Web application
2. **Name**: Restaurant Reviews Web Client
3. **Authorized JavaScript origins**:
   ```
   https://restaurantreviews.io
   http://localhost:3000 (for development)
   ```
4. **Authorized redirect URIs**:
   ```
   https://restaurantreviews.io/api/auth/social/google/callback
   http://localhost:3000/api/auth/social/google/callback (for development)
   ```
5. Click **"Create"**
6. **Copy** the **Client ID** and **Client Secret**

### Step 5: Get Credentials

- **Client ID**: From OAuth 2.0 Client IDs section
- **Client Secret**: From OAuth 2.0 Client IDs section (click eye icon to reveal)

---

## X (Twitter) Setup

### Step 1: Create Twitter Developer Account

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Sign in with your Twitter account
3. Click **"Sign up"** or **"Apply"** for developer access
4. Complete the application form:
   - **Use case**: Making a bot, Exploring the API, etc.
   - **Description**: "OAuth authentication for Restaurant Reviews platform"
5. Accept terms and submit

### Step 2: Create App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Click **"Create App"** or **"Create Project"**
3. Fill in:
   - **App name**: Restaurant Reviews
   - **App environment**: Development (or Production)
   - **Use case**: User authentication
4. Click **"Create"**

### Step 3: Configure App Settings

1. Go to your app → **Settings** → **User authentication settings**
2. Click **"Set up"**
3. Configure:
   - **App permissions**: Read and write (or Read only for OAuth)
   - **Type of App**: Web App, Automated App or Bot
   - **App info**:
     - **Callback URI / Redirect URL**:
       ```
       https://restaurantreviews.io/api/auth/social/twitter/callback
       http://localhost:3000/api/auth/social/twitter/callback (for development)
       ```
     - **Website URL**: `https://restaurantreviews.io`
     - **Terms of Service**: `https://restaurantreviews.io/terms`
     - **Privacy Policy**: `https://restaurantreviews.io/privacy`
4. Click **"Save"**

### Step 4: Get API Keys

1. Go to **Keys and tokens** tab
2. Note:
   - **API Key** (Consumer Key)
   - **API Secret** (Consumer Secret)
   - **Bearer Token** (optional, for OAuth 2.0)

### Step 5: Generate Access Tokens (OAuth 1.0a)

If using OAuth 1.0a:
1. Go to **Keys and tokens**
2. Under **Access Token and Secret**, click **"Generate"**
3. Copy **Access Token** and **Access Token Secret**

**Note**: For OAuth 2.0, you'll use API Key and API Secret only.

---

## Environment Variables

Add these to your `.env.local` file (frontend) and backend `.env`:

```env
# Facebook OAuth
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_API_VERSION=v18.0

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# X (Twitter) OAuth
NEXT_PUBLIC_TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here (for OAuth 1.0a)
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret_here (for OAuth 1.0a)

# Frontend URLs
NEXT_PUBLIC_FRONTEND_URL=https://restaurantreviews.io
NEXT_PUBLIC_API_BASE_URL=https://restaurantreviews.io

# OAuth Callback URLs (for reference)
FACEBOOK_CALLBACK_URL=https://restaurantreviews.io/api/auth/social/facebook/callback
GOOGLE_CALLBACK_URL=https://restaurantreviews.io/api/auth/social/google/callback
TWITTER_CALLBACK_URL=https://restaurantreviews.io/api/auth/social/twitter/callback
```

### Development vs Production

For **development** (localhost):
```env
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

For **production**:
```env
NEXT_PUBLIC_FRONTEND_URL=https://restaurantreviews.io
NEXT_PUBLIC_API_BASE_URL=https://restaurantreviews.io
```

---

## Backend Configuration

### Required Backend Endpoints

Your backend needs to implement these endpoints:

1. **Facebook OAuth**:
   ```
   POST /api/auth/social/facebook/
   POST /api/auth/social/facebook/callback
   ```

2. **Google OAuth**:
   ```
   POST /api/auth/social/google/
   POST /api/auth/social/google/callback
   ```

3. **Twitter/X OAuth**:
   ```
   POST /api/auth/social/twitter/
   POST /api/auth/social/twitter/callback
   ```

### Backend Libraries Needed

**Django (Python)**:
```bash
pip install django-allauth
# or
pip install social-auth-app-django
```

**Node.js/Express**:
```bash
npm install passport passport-facebook passport-google-oauth20 passport-twitter
```

### Backend Configuration Example (Django)

```python
# settings.py
INSTALLED_APPS = [
    ...
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.facebook',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.twitter',
]

SOCIALACCOUNT_PROVIDERS = {
    'facebook': {
        'APP': {
            'client_id': os.getenv('FACEBOOK_APP_ID'),
            'secret': os.getenv('FACEBOOK_APP_SECRET'),
            'key': ''
        },
        'SCOPE': ['email', 'public_profile'],
        'AUTH_PARAMS': {'auth_type': 'reauthenticate'},
        'METHOD': 'oauth2',
        'VERIFIED_EMAIL': True,
    },
    'google': {
        'APP': {
            'client_id': os.getenv('GOOGLE_CLIENT_ID'),
            'secret': os.getenv('GOOGLE_CLIENT_SECRET'),
            'key': ''
        },
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    },
    'twitter': {
        'APP': {
            'client_id': os.getenv('TWITTER_API_KEY'),
            'secret': os.getenv('TWITTER_API_SECRET'),
            'key': ''
        }
    }
}
```

---

## Testing

### Test Accounts

Create test accounts for each platform:

1. **Facebook**: Use your personal account or create a test account
2. **Google**: Use your Gmail account or create a test account
3. **Twitter/X**: Use your Twitter account

### Testing Checklist

- [ ] Facebook login button redirects to Facebook OAuth
- [ ] Google login button redirects to Google OAuth
- [ ] X login button redirects to Twitter OAuth
- [ ] After OAuth, user is redirected back to your app
- [ ] User data (email, name) is retrieved correctly
- [ ] JWT tokens are generated and stored
- [ ] User can proceed to Step 2 (Restaurant Selection)
- [ ] User can complete registration flow

### Common Issues

1. **"Redirect URI mismatch"**:
   - Ensure callback URLs match exactly in provider settings
   - Check for trailing slashes
   - Verify HTTP vs HTTPS

2. **"Invalid credentials"**:
   - Double-check App ID/Secret, Client ID/Secret
   - Ensure secrets are not exposed in frontend code
   - Verify environment variables are loaded correctly

3. **"App not approved"**:
   - Facebook/Google apps may need review for production
   - Use test mode during development
   - Add test users in provider dashboards

---

## Security Best Practices

1. **Never expose secrets in frontend code**
   - Use environment variables
   - Keep secrets server-side only

2. **Use HTTPS in production**
   - OAuth requires HTTPS for production
   - Use Let's Encrypt for free SSL certificates

3. **Validate tokens server-side**
   - Always verify OAuth tokens on backend
   - Don't trust client-side tokens

4. **Rate limiting**
   - Implement rate limiting on OAuth endpoints
   - Prevent abuse

5. **CSRF protection**
   - Use CSRF tokens for OAuth flows
   - Validate state parameters

---

## Next Steps

1. Set up all three OAuth providers using this guide
2. Add credentials to environment variables
3. Configure backend endpoints
4. Test each provider
5. Update frontend to use new icons and labels (already done)
6. Implement OAuth callback handlers
7. Test complete registration flow

---

## Support Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Google Identity Services](https://developers.google.com/identity)
- [Twitter OAuth Documentation](https://developer.twitter.com/en/docs/authentication/overview)
- [Django Allauth Documentation](https://django-allauth.readthedocs.io/)
- [Passport.js Documentation](http://www.passportjs.org/)

---

## Questions?

If you encounter issues:
1. Check provider developer dashboards for error logs
2. Verify callback URLs match exactly
3. Ensure environment variables are set correctly
4. Check browser console for frontend errors
5. Check backend logs for API errors
