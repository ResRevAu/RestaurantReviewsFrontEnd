# Backend Fix Required: New Restaurant Owner Validation Issue

## Issue Summary

When creating a **NEW restaurant** during registration (`action='create'`), the backend is:
1. ✅ Creating the restaurant successfully
2. ✅ Assigning the user as owner immediately (via `serializer.save(owner=user)`)
3. ❌ **Then failing** when trying to create a claim request because the restaurant "already has an owner"

**Error:** `ValidationError: {'restaurant': ['This restaurant already has an owner and cannot be claimed.']}`

## Problem Analysis

### Current Backend Flow (Incorrect):
```
action='create':
1. Create Restaurant with owner=user (via serializer.save(owner=user))
2. Try to create RestaurantClaimRequest
3. Validation checks: "Does restaurant have owner?"
4. ❌ YES → Validation fails: "Cannot claim restaurant with owner"
```

### Expected Backend Flow (Correct):
```
action='create':
1. Create Restaurant WITHOUT owner (owner=None)
2. Create RestaurantClaimRequest with status='pending'
3. ✅ Success - Claim request created, awaiting admin approval
4. Admin approves → Owner assigned later
```

## Root Cause

The backend is assigning the owner **immediately** when creating a new restaurant, but then trying to create a **claim request** which requires the restaurant to **not have an owner yet**.

**The logic conflict:**
- `serializer.save(owner=user)` assigns owner immediately
- Claim request validation requires restaurant to have no owner
- These two steps conflict with each other

## Expected Behavior

### For NEW Restaurants (`action='create'`):

1. **Create restaurant WITHOUT owner:**
   ```python
   restaurant = Restaurant.objects.create(
       name=...,
       street_address=...,
       # ... other fields
       owner=None  # NO OWNER initially
   )
   ```

2. **Create claim request (pending):**
   ```python
   claim_request = RestaurantClaimRequest.objects.create(
       user=user,
       restaurant=restaurant,  # Restaurant with NO owner
       ownership_proof=ownership_proof_file,
       status='pending'  # Awaiting admin verification
   )
   ```

3. **Return success response:**
   ```python
   return Response({
       'message': 'Registration completed! Please check your email to verify your account.',
       'restaurant': {...},
       'claim_status': {
           'status': 'pending',
           'claim_id': claim_request.id,
           'message': 'Restaurant claim request submitted. Awaiting admin verification.'
       },
       ...
   })
   ```

### For EXISTING Restaurants (`action='select'`):

Current behavior is correct:
1. Restaurant already exists (may or may not have owner)
2. Check if restaurant has owner
3. If no owner → Create claim request
4. If has owner → Return error (already working correctly)

## Required Fix

### Option 1: Create Restaurant Without Owner (Recommended)

**In `RegisterStep2View` when `action='create'`:**

```python
if action == 'create':
    # Create restaurant WITHOUT owner
    restaurant_data = {
        'name': request.POST.get('name'),
        'street_address': request.POST.get('street_address'),
        'city': request.POST.get('city'),
        'country': request.POST.get('country'),
        # ... other fields
        # DO NOT include 'owner' here
    }
    
    serializer = RestaurantSerializer(data=restaurant_data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    restaurant = serializer.save()  # NO owner=user here!
    
    # Now create claim request (restaurant has no owner, so validation passes)
    claim_request = RestaurantClaimRequest.objects.create(
        user=user,
        restaurant=restaurant,
        ownership_proof=ownership_proof_file,
        status='pending'
    )
```

### Option 2: Skip Claim Request if Owner Assigned Immediately

**Alternative approach (if you want to assign owner immediately):**

```python
if action == 'create':
    # Create restaurant WITH owner
    restaurant = serializer.save(owner=user)
    
    # Skip claim request creation since owner is already assigned
    # Just assign subscription and return success
    # (But this doesn't match expected behavior - claim request should be created)
```

**Note:** Option 1 is recommended because it matches the expected behavior where claim requests appear in admin panel for verification.

## Frontend Data Being Sent

The frontend is correctly sending:
```
user_id: 46
action: 'create'
name: 'newResRes'
street_address: '123 makind'
city: 'Robina'
country: 'Australia'
state: '...'
postal_code: '...'
ownership_proof: <file>
```

## Error Details

**Error Type:** `ValidationError`  
**Error Message:** `{'restaurant': ['This restaurant already has an owner and cannot be claimed.']}`  
**Status Code:** 500  
**Location:** When trying to create `RestaurantClaimRequest` after creating restaurant with owner

## Testing After Fix

After implementing the fix, verify:

1. [ ] New restaurant is created **without owner** (`owner=None`)
2. [ ] `RestaurantClaimRequest` is created successfully
3. [ ] Claim request has `status='pending'`
4. [ ] Claim request appears in admin panel: `/admin/restaurants/restaurantclaimrequest/`
5. [ ] Response format matches `action='select'` response
6. [ ] No validation errors occur

## Summary

**Issue:** New restaurants are being created with owner immediately, then claim request creation fails validation.

**Fix:** Create new restaurants **without owner** initially, then create claim request. Owner will be assigned after admin approval.

**Priority:** High - This blocks new restaurant registration flow.
