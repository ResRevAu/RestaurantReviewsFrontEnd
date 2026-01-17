# Backend Fix Required: `register-step2` Endpoint - Creating New Restaurant

## Issue Summary
The `register-step2` endpoint works correctly when **selecting an existing restaurant** (`action='select'`), but fails with a 500 error when **creating a new restaurant** (`action='create'`).

## Current Status

### ✅ What Works (Selecting Existing Restaurant)
- User selects an existing restaurant from database
- Backend successfully:
  - Fetches user by `user_id`
  - Creates `RestaurantClaimRequest` linking user to existing restaurant
  - Assigns free plan subscription
  - Returns success response
- Claim request appears in admin panel: `/admin/restaurants/restaurantclaimrequest/`

**Example successful request:**
```
FormData:
- user_id: 46
- action: 'select'
- restaurant_id: 218275
- ownership_proof: <file>

Response: Success ✅
```

### ❌ What Fails (Creating New Restaurant)
- User fills out form to create a new restaurant
- Backend throws error: `AttributeError: 'NoneType' object has no attribute 'user'`
- Status: 500 Internal Server Error
- No restaurant or claim request is created

**Example failing request:**
```
FormData:
- user_id: 46
- action: 'create'
- name: "New Restaurant Name"
- street_address: "123 Main St"
- city: "Sydney"
- country: "Australia"
- state: "NSW" (optional)
- postal_code: "2000" (optional)
- primary_phone: "+61..." (optional)
- primary_email: "restaurant@example.com" (optional)
- latitude: "-33.8688" (optional)
- longitude: "151.2093" (optional)
- ownership_proof: <file>

Response: 500 Error ❌
```

## Expected Behavior

### Registration Flow
1. **Step 1** (`/api/auth/register-step1/`):
   - Creates new user account
   - Returns `user_id` (e.g., 46)
   - ✅ **This is working correctly**

2. **Step 2** (`/api/auth/register-step2/`):
   - **If `action='select'`**: Links user to existing restaurant ✅ **Working**
   - **If `action='create'`**: Should:
     1. Create new `Restaurant` object with provided details
     2. Create `RestaurantClaimRequest` linking the new user to the new restaurant
     3. Set claim status to `'pending'`
     4. Assign free plan subscription to user
     5. Return success response
     6. **Claim request should appear in admin panel** (`/admin/restaurants/restaurantclaimrequest/`)
   - ❌ **This is currently failing**

### Expected Response Format (Same for Both Actions)
```json
{
  "message": "Registration completed! Please check your email to verify your account.",
  "email_verification_sent": true,
  "requires_email_verification": true,
  "user_id": 46,
  "restaurant": {
    "id": <restaurant_id>,
    "name": "<restaurant_name>",
    "address": "<full_address>"
  },
  "claim_status": {
    "status": "pending",
    "claim_id": <claim_id>,
    "message": "Restaurant claim request submitted. Awaiting admin verification."
  },
  "subscription": {
    "id": <subscription_id>,
    "plan_id": 4,
    "plan_name": "Free Plan",
    "plan_type": "Restaurant Owner",
    "billing_cycle": "monthly",
    "status": "active",
    "start_date": "<timestamp>",
    "end_date": null,
    "is_active": true
  },
  "next_step": "email_verification"
}
```

## Error Details

**Error Message:**
```
AttributeError: 'NoneType' object has no attribute 'user'
at /api/auth/register-step2/
```

**HTTP Status:** 500 Internal Server Error

**Error Location:** Likely in the `action='create'` branch of the `register-step2` view

## Root Cause Analysis

The error `'NoneType' object has no attribute 'user'` suggests the backend code is trying to access `.user` on a `None` value. Possible causes:

1. **Using `request.user` instead of fetching by `user_id`:**
   ```python
   # WRONG (for unauthenticated registration):
   user = request.user  # This is None for unauthenticated requests!
   
   # CORRECT:
   user_id = request.POST.get('user_id') or request.data.get('user_id')
   user = User.objects.get(id=user_id)
   ```

2. **Accessing `.user` on restaurant before it exists:**
   ```python
   # WRONG:
   restaurant.user  # restaurant might be None or doesn't have user yet
   
   # CORRECT:
   restaurant = Restaurant.objects.create(...)
   # Then create claim request separately
   ```

3. **Not handling `action='create'` branch correctly:**
   - The code might be missing the logic to create a new restaurant
   - Or it's trying to access a restaurant object that doesn't exist yet

## Required Fix

### Step-by-Step Implementation

1. **Get `user_id` from form data:**
   ```python
   user_id = request.POST.get('user_id') or request.data.get('user_id')
   if not user_id:
       return Response({'error': 'user_id is required'}, status=400)
   ```

2. **Fetch the user:**
   ```python
   try:
       user = User.objects.get(id=user_id)
   except User.DoesNotExist:
       return Response({'error': 'User not found'}, status=400)
   ```

3. **Handle `action='create'` branch:**
   ```python
   if action == 'create':
       # Create new restaurant
       restaurant = Restaurant.objects.create(
           name=request.POST.get('name'),
           street_address=request.POST.get('street_address'),
           city=request.POST.get('city'),
           country=request.POST.get('country'),
           state=request.POST.get('state', ''),
           postal_code=request.POST.get('postal_code', ''),
           primary_phone=request.POST.get('primary_phone', ''),
           primary_email=request.POST.get('primary_email', ''),
           latitude=request.POST.get('latitude') or None,
           longitude=request.POST.get('longitude') or None,
           # Add any other required fields
       )
       
       # Create claim request linking user to new restaurant
       claim_request = RestaurantClaimRequest.objects.create(
           user=user,  # Use the fetched user object
           restaurant=restaurant,  # The newly created restaurant
           ownership_proof=ownership_proof_file,  # From request.FILES
           status='pending',  # Awaiting admin verification
           # Add any other required fields
       )
       
   elif action == 'select':
       # Existing logic for selecting restaurant
       restaurant_id = request.POST.get('restaurant_id')
       restaurant = Restaurant.objects.get(id=restaurant_id)
       # ... rest of existing logic
   ```

4. **Assign free plan subscription** (same as `action='select'`):
   ```python
   # Create or get free plan subscription
   subscription = create_free_subscription(user)  # Or your existing logic
   ```

5. **Return consistent response format:**
   ```python
   return Response({
       'message': 'Registration completed! Please check your email to verify your account.',
       'email_verification_sent': True,
       'requires_email_verification': True,
       'user_id': user.id,
       'restaurant': {
           'id': restaurant.id,
           'name': restaurant.name,
           'address': restaurant.get_full_address(),  # Or format address
       },
       'claim_status': {
           'status': 'pending',
           'claim_id': claim_request.id,
           'message': 'Restaurant claim request submitted. Awaiting admin verification.'
       },
       'subscription': {
           # Subscription details
       },
       'next_step': 'email_verification'
   }, status=200)
   ```

## Important Notes

1. **User is already created**: The user account is created in Step 1, so Step 2 should only create the restaurant and claim request.

2. **Claim request should appear in admin**: The `RestaurantClaimRequest` created for new restaurants should appear in the Django admin panel at `/admin/restaurants/restaurantclaimrequest/`, just like when selecting an existing restaurant.

3. **Restaurant can be temporary**: The restaurant can be created as-is (doesn't need to be marked as temporary). The claim request handles the verification process.

4. **Consistent behavior**: Both `action='select'` and `action='create'` should follow the same flow:
   - Fetch user by `user_id`
   - Create/select restaurant
   - Create claim request
   - Assign subscription
   - Return same response format

## Testing Checklist

After implementing the fix, verify:

- [ ] New restaurant is created with correct details
- [ ] `RestaurantClaimRequest` is created linking user to new restaurant
- [ ] Claim request appears in admin panel (`/admin/restaurants/restaurantclaimrequest/`)
- [ ] Free plan subscription is assigned
- [ ] Response format matches `action='select'` response
- [ ] No `AttributeError` or other exceptions occur
- [ ] Ownership proof file is saved correctly

## Frontend Data Being Sent

The frontend is correctly sending all required data. Here's what's being sent for `action='create'`:

```javascript
FormData {
  user_id: "46",
  action: "create",
  name: "<restaurant_name>",
  street_address: "<street_address>",
  city: "<suburb>",
  country: "Australia",
  state: "<state>",  // optional
  postal_code: "<postcode>",  // optional
  primary_phone: "<phone>",  // optional
  primary_email: "<email>",  // optional
  latitude: "<lat>",  // optional
  longitude: "<lng>",  // optional
  ownership_proof: <File>  // required
}
```

## Request

Please fix the `action='create'` branch in the `register-step2` endpoint to:
1. Create a new restaurant with the provided details
2. Create a `RestaurantClaimRequest` linking the user to the new restaurant
3. Return the same response format as `action='select'`
4. Ensure the claim request appears in the admin panel

The frontend is working correctly and sending all required data. The issue is in the backend handling of the `action='create'` case.
