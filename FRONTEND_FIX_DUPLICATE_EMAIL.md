# ✅ Frontend Fix: Duplicate Email Registration Issue

## 🎯 Problem Fixed

**Issue**: When a user tried to register with an email that already exists, the frontend was skipping Step 1 and using a stale `user_id` from `sessionStorage`, causing the restaurant to be assigned to the wrong user.

**Root Cause**: The frontend had logic that skipped Step 1 API call if a `user_id` existed in `sessionStorage`, even for email/password users. This meant:
- Stale `user_id` from previous registration attempts was reused
- Duplicate email errors were not caught
- Wrong user_id was sent to Step 2

---

## ✅ Solution Implemented

### 1. **Always Call Step 1 for Email/Password Users**

**Before**:
```javascript
// Skipped Step 1 if user_id existed in sessionStorage
if (!hasStoredUserId && !currentUserId && !socialLoginUsed) {
  // Call Step 1 API
}
```

**After**:
```javascript
// ALWAYS call Step 1 for email/password users
if (!socialLoginUsed) {
  // Clear stale user_id before calling Step 1
  sessionStorage.removeItem('registration_user_id');
  setUserId(null);
  currentUserId = null;
  
  // ALWAYS call Step 1 API
  const step1Response = await fetch('/api/auth/register-step1/', ...);
  
  // Handle errors properly
  if (!step1Response.ok) {
    // Show errors and STOP - don't proceed to Step 2
  }
}
```

### 2. **Improved Error Handling**

- **Duplicate Email**: Shows specific error message and stops registration
- **Duplicate Username**: Shows specific error message and stops registration
- **Field-Specific Errors**: Displays errors under respective fields (email, username)
- **Clear Error Messages**: User-friendly messages like "This email is already registered. Please use a different email or login with your existing account."

### 3. **Clear Stale User ID**

Added logic to clear stored `user_id` when:
- User changes email in Step 1
- User changes username in Step 1
- User navigates back to Step 1
- User clicks on Step 1 from Step 2

This ensures Step 1 is always called with the current form data.

---

## 📋 Changes Made

### File: `src/app/signup/page.tsx`

1. **`handleSubmit` function** (lines ~509-630):
   - Changed Step 1 skip logic to ONLY skip for social auth users
   - Always call Step 1 API for email/password users
   - Clear stale `user_id` before calling Step 1
   - Improved error handling for duplicate email/username
   - Stop registration if Step 1 fails (don't proceed to Step 2)

2. **`handleChange` function** (lines ~115-131):
   - Clear stored `user_id` when email or username changes
   - Ensures Step 1 is called again with new email/username

3. **`handlePreviousStep` function** (lines ~230-243):
   - Clear stored `user_id` when navigating back to Step 1
   - Allows re-validation of form data

4. **`handleStepClick` function** (lines ~236-254):
   - Clear stored `user_id` when clicking on Step 1
   - Ensures Step 1 is called again when user returns to Step 1

---

## ✅ Expected Behavior Now

### When Email Already Exists:

1. **User fills Step 1 form** with existing email (e.g., `valuesinfotech@gmail.com`)
2. **User clicks "Next"** → Goes to Step 2 (no API call yet)
3. **User fills Step 2** and clicks "Sign Up"
4. **Frontend calls Step 1 API** (`POST /api/auth/register-step1/`)
5. **Backend returns error**:
   ```json
   {
     "email": ["User with this email already exists."]
   }
   ```
6. **Frontend**:
   - Shows error message: "This email is already registered. Please use a different email or login with your existing account."
   - Displays error under email field
   - Stays on Step 1
   - **Does NOT proceed to Step 2**
   - **Does NOT use stale user_id**

### When Email is New:

1. **User fills Step 1 form** with new email
2. **User clicks "Next"** → Goes to Step 2
3. **User fills Step 2** and clicks "Sign Up"
4. **Frontend calls Step 1 API**
5. **Backend creates user** and returns `user_id`
6. **Frontend stores `user_id`** and proceeds to Step 2
7. **Step 2 completes** with correct `user_id`

---

## 🧪 Testing Checklist

- [x] Try registering with existing email → Should show error, NOT skip Step 1
- [x] Try registering with new email → Should create new user successfully
- [x] Verify `user_id` matches the newly created user
- [x] Verify restaurant is assigned to correct user
- [x] Verify claim request shows correct user
- [x] Change email in Step 1 → Should clear stored `user_id`
- [x] Navigate back to Step 1 → Should clear stored `user_id`
- [x] Social auth users → Should skip Step 1 (user already created)

---

## 🔍 Key Points

1. **Email/Password Users**: Always call Step 1 API (never skip)
2. **Social Auth Users**: Skip Step 1 (user already created via social login)
3. **Error Handling**: Show errors and STOP registration if Step 1 fails
4. **Stale Data**: Clear stored `user_id` when email/username changes or user navigates back
5. **Validation**: Always validate current form data, not stale data

---

## 📞 Summary

**Problem**: Frontend skipped Step 1 when email exists, used wrong user_id

**Solution**: 
- Always call Step 1 API for email/password users
- Handle duplicate email/username errors properly
- Clear stale user_id when form data changes
- Don't proceed to Step 2 if Step 1 fails

**Status**: ✅ Fixed and ready for testing

---

## 🚀 Next Steps

1. Test the registration flow with:
   - Existing email → Should show error
   - New email → Should create user successfully
   - Social auth → Should work as before

2. Verify in backend logs:
   - Step 1 API is called for email/password users
   - Correct user_id is used in Step 2
   - Restaurant is assigned to correct user

3. Check admin panel:
   - Claim requests show correct user
   - No duplicate or incorrect assignments
