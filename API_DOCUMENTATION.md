# Authentication API Documentation

## Endpoints

### Register User
- **URL**: `/api/auth/register/`
- **Method**: POST
- **Data**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "confirm_password": "string",
    "user_type": "CUSTOMER|OWNER",
    "first_name": "string",     // Optional
    "last_name": "string",      // Optional
    "phone_number": "string",   // Optional
    "about_me": "string",       // Optional
    "gender": "string"          // Optional (M/F/O/N)
  }
  ```
- **Success Response**: 
  - **Code**: 201 Created
  - **Content**:
    ```json
    {
      "user": {
        "id": "integer",
        "username": "string",
        "email": "string",
        "first_name": "string",
        "last_name": "string",
        "user_type": "string",
        "phone_number": "string",
        "profile_picture": "url|null",
        "about_me": "string",
        "gender": "string",
        "gender_display": "string"
      },
      "message": "User Created Successfully"
    }
    ```
- **Error Response**: 400 Bad Request

### Login
- **URL**: `/api/auth/login/`
- **Method**: POST
- **Description**: Authenticates a user using email/username and password
- **Request Body**:
  ```json
  {
    "email_or_username": "string",  // Can be either email or username
    "password": "string"
  }
  ```
- **Success Response**: 
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "status": "success",
      "access": "string",      // JWT access token
      "refresh": "string",     // JWT refresh token
      "user": {
        "id": "integer",
        "username": "string",
        "email": "string",
        "first_name": "string",
        "last_name": "string",
        "user_type": "string", // CUSTOMER, OWNER, or ADMIN
        "phone_number": "string",
        "profile_picture": "string|null",
        "about_me": "string",
        "gender": "string",    // M, F, O, or N
        "gender_display": "string" // Male, Female, Other, or Prefer not to say
      }
    }
    ```

- **Error Responses**:
  - **Code**: 400 Bad Request
  - **Content Examples**:
    ```json
    {
      "error": {
        "email_or_username": ["No account found with this email address."]
      }
    }
    ```
    ```json
    {
      "error": {
        "email_or_username": ["No account found with this username."]
      }
    }
    ```
    ```json
    {
      "error": {
        "error": "Invalid credentials. Please check your email/username and password."
      }
    }
    ```
    ```json
    {
      "error": {
        "error": "This account is inactive or has been disabled."
      }
    }
    ```
    ```json
    {
      "error": {
        "error": "Both email/username and password are required."
      }
    }
    ```

  - **Code**: 500 Internal Server Error
  - **Content**:
    ```json
    {
      "error": "Database error occurred. Please try again."
    }
    ```
    ```json
    {
      "error": "An unexpected error occurred. Please try again."
    }
    ```

### Forgot Password
- **URL**: `/api/auth/forgot-password/`
- **Method**: POST
- **Description**: Initiates a password reset by sending a reset link to the user's email address if it exists in the system. Always returns a generic success message for security.
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "message": "If an account with that email exists, a password reset link has been sent."
    }
    ```
- **Error Response**: 400 Bad Request (for invalid email format)

### Reset Password
- **URL**: `/api/auth/reset-password/`
- **Method**: POST
- **Description**: Resets the user's password using the UID and token from the reset link.
- **Request Body**:
  ```json
  {
    "uid": "string",           // UID from reset link
    "token": "string",         // Token from reset link
    "new_password": "string",
    "confirm_password": "string"
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "message": "Password has been reset successfully."
    }
    ```
- **Error Responses**:
  - **Code**: 400 Bad Request
    - Invalid or expired token, mismatched passwords, or invalid UID.
    - Example:
      ```json
      {
        "token": "Invalid or expired token."
      }
      ```
      ```json
      {
        "uid": "Invalid reset link."
      }
      ```
      ```json
      {
        "new_password": "Passwords do not match."
      }
      ```

### Refresh Token
- **URL**: `/api/auth/refresh/`
- **Method**: POST
- **Data**:
  ```json
  {
    "refresh": "string"
  }
  ```
- **Success Response**: 200 OK
  ```json
  {
    "access": "string"
  }
  ```
- **Error Response**: 401 Unauthorized

## Authentication
All protected endpoints require a Bearer token in the Authorization header: 

### User Profile Management

#### Get Profile
- **URL**: `/api/profile/`
- **Method**: GET
- **Authentication**: Required
- **Success Response**: 
  ```json
  {
    "status": "success",
    "user": {
      "id": "integer",
      "username": "string",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "user_type": "string",
      "phone_number": "string",
      "profile_picture": "url|null",
      "about_me": "string",
      "gender": "string",
      "gender_display": "string"
    }
  }
  ```

#### Update Profile
- **URL**: `/api/profile/`
- **Method**: PATCH
- **Authentication**: Required
- **Content-Type**: multipart/form-data
- **Request Body**:
  ```json
  {
    "first_name": "string",      // Optional
    "last_name": "string",       // Optional
    "phone_number": "string",    // Optional
    "about_me": "string",        // Optional
    "gender": "string",          // Optional (M/F/O/N)
    "profile_picture": "file"    // Optional, image file
  }
  ```
- **Success Response**: 
  ```json
  {
    "status": "success",
    "message": "Profile updated successfully",
    "user": {
      "id": "integer",
      "username": "string",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "user_type": "string",
      "phone_number": "string",
      "profile_picture": "url|null",
      "about_me": "string",
      "gender": "string",
      "gender_display": "string"
    }
  }
  ```
- **Error Response**:
  ```json
  {
    "status": "error",
    "errors": {
      "field_name": ["error message"]
    }
  }
  ``` 

# Restaurant Management API Documentation

## Base URL
All restaurant endpoints are prefixed with: `/api/restaurants/`

## Core Endpoints

### List Restaurants
- **URL**: `/api/restaurants/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns a paginated list of restaurants with search and filtering capabilities
- **Query Parameters**:
  - `page`: Page number for pagination
  - `search`: Search term for restaurant name/city/cuisine/venue type
  - `venue_type`: Filter by venue type code
  - `cuisine`: Filter by cuisine type code
  - `region`: Filter by cuisine region code
  - `subregion`: Filter by cuisine subregion code
  - `city`: Filter by city name
  - `approved`: Filter by approval status (staff only) - true/false
  - `sort`: Sort order - name/newest/oldest/city
- **Success Response**: 
  ```json
  {
    "count": "integer",
    "next": "url|null",
    "previous": "url|null",
    "results": [
      {
        "id": "integer",
        "name": "string",
        "owner": "integer",
        "owner_name": "string",
        "phone": "string",
        "website": "string",
        "email": "string",
        "country": "string",
        "street_address": "string",
        "room_number": "string",
        "city": "string",
        "state": "string",
        "postal_code": "string",
        "latitude": "decimal",
        "longitude": "decimal",
        "venue_types": [{"id": "integer", "name": "string", "code": "string"}],
        "cuisine_styles": [{"id": "integer", "name": "string", "code": "string"}],
        "logo": "url|null",
        "is_approved": "boolean",
        "total_images": "integer",
        "has_operating_hours": "boolean", 
        "review_count": "integer",
        "created_at": "datetime",
        "updated_at": "datetime",
        "images": [],
        "videos": [],
        "operating_hours": [],
        "holiday_hours": [],
        "amenities": {}
      }
    ]
  }
  ```

### Create Restaurant
- **URL**: `/api/restaurants/`
- **Method**: POST
- **Authentication**: Required (Restaurant Owner only)
- **Content-Type**: multipart/form-data
- **Request Body**:
  ```json
  {
    "name": "string",
    "phone": "string",
    "website": "string (optional)",
    "email": "string",
    "country": "string",
    "street_address": "string",
    "room_number": "string (optional)",
    "city": "string",
    "state": "string",
    "postal_code": "string",
    "latitude": "decimal (optional)",
    "longitude": "decimal (optional)",
    "venue_type_ids": ["integer"],
    "cuisine_style_ids": ["integer"],
    "logo": "file (optional)"
  }
  ```
- **Success Response**: 201 Created
- **Error Response**: 400 Bad Request

### Get Restaurant Details
- **URL**: `/api/restaurants/{id}/`
- **Method**: GET
- **Authentication**: Optional
- **Success Response**: 200 OK (same structure as list but single object)

### Update Restaurant
- **URL**: `/api/restaurants/{id}/`
- **Method**: PUT/PATCH
- **Authentication**: Required (Restaurant Owner only)
- **Content-Type**: multipart/form-data
- **Request Body**: Same as Create Restaurant
- **Success Response**: 200 OK
- **Error Response**: 403 Forbidden if not owner

### Delete Restaurant
- **URL**: `/api/restaurants/{id}/`
- **Method**: DELETE
- **Authentication**: Required (Restaurant Owner only)
- **Success Response**: 204 No Content
- **Error Response**: 403 Forbidden if not owner

## Search & Discovery Endpoints

### Advanced Search
- **URL**: `/api/restaurants/search/`
- **Method**: GET
- **Authentication**: Optional
- **Query Parameters**:
  - `query`: Search term for name/city/address/cuisine/venue type
  - `location`: Location-based search (city/address/state)
  - `cuisine`: Filter by cuisine type code
  - `region`: Filter by cuisine region code
  - `subregion`: Filter by cuisine subregion code
  - `venue_type`: Filter by venue type code
- **Success Response**: 200 OK (paginated results)

### Filter Restaurants
- **URL**: `/api/restaurants/filter/`
- **Method**: GET
- **Authentication**: Optional
- **Query Parameters**:
  - `venue_types[]`: Array of venue type codes
  - `cuisines[]`: Array of cuisine type codes
  - `regions[]`: Array of cuisine region codes
  - `subregions[]`: Array of cuisine subregion codes
  - `cities[]`: Array of city names
  - `amenities[]`: Array of amenity codes
  - `amenity_super_categories[]`: Array of amenity super category codes
- **Success Response**: 200 OK (filtered results)
- **Example**:
  ```
  GET /api/restaurants/filter/?amenities[]=highchairs-available&amenity_super_categories[]=parking&cuisines[]=italian
  ```

### Nearby Restaurants
- **URL**: `/api/restaurants/nearby/`
- **Method**: GET
- **Authentication**: Optional
- **Query Parameters**:
  - `lat`: Latitude (required)
  - `lon`: Longitude (required)
  - `radius`: Search radius in kilometers (default: 10)
- **Success Response**: 
  ```json
  {
    "count": "integer",
    "results": [
      {
        // Restaurant object with additional field:
        "distance": "decimal" // Distance in kilometers
      }
    ]
  }
  ```
- **Error Response**: 400 Bad Request if lat/lon missing

## Image Management

### Upload Restaurant Images
- **URL**: `/api/restaurants/{id}/upload_images/`
- **Method**: POST
- **Authentication**: Required (Restaurant Owner only)
- **Content-Type**: multipart/form-data
- **Request Body**:
  ```json
  {
    "images": "file[]",
    "video_url": "string (optional)",
    "is_video_thumbnail": "boolean (optional)"
  }
  ```
- **Success Response**: 201 Created
  ```json
  [
    {
      "id": "integer",
      "image": "url",
      "is_video_thumbnail": "boolean",
      "video_url": "string|null",
      "caption": "string",
      "keywords": "string",
      "copyright": "string",
      "created_at": "datetime"
    }
  ]
  ```

### Delete Restaurant Image
- **URL**: `/api/restaurants/{id}/delete_image/`
- **Method**: DELETE
- **Authentication**: Required (Restaurant Owner only)
- **Request Body**:
  ```json
  {
    "image_id": "integer"
  }
  ```
- **Success Response**: 200 OK
  ```json
  {
    "message": "Image deleted successfully"
  }
  ```

## Hours Management

### Set Operating Hours
- **URL**: `/api/restaurants/{id}/set_hours/`
- **Method**: POST
- **Authentication**: Required (Restaurant Owner only)
- **Request Body**:
  ```json
  {
    "operating_hours": [
      {
        "day": "MON|TUE|WED|THU|FRI|SAT|SUN",
        "open_time": "HH:MM:SS",
        "close_time": "HH:MM:SS",
        "is_closed": "boolean"
      }
    ],
    "holiday_hours": [
      {
        "holiday": "integer", // Holiday ID
        "open_time": "HH:MM:SS",
        "close_time": "HH:MM:SS",
        "is_closed": "boolean"
      }
    ]
  }
  ```
- **Success Response**: 200 OK
  ```json
  {
    "message": "Hours updated successfully"
  }
  ```

### Set Amenities
- **URL**: `/api/restaurants/{id}/set_amenities/`
- **Method**: POST
- **Authentication**: Required (Restaurant Owner only)
- **Request Body**:
  ```json
  {
    "selected_amenity_ids": ["integer"],
    "additional_amenities": "string" // Comma-separated additional amenities
  }
  ```
- **Success Response**: 200 OK

## Video Management

### Restaurant Video Structure
Restaurant videos are included in the `videos` array of restaurant responses:

```json
{
  "videos": [
    {
      "id": "integer",
      "platform": "string",           // YouTube, Vimeo, Facebook, Instagram, TikTok, or empty
      "custom_platform": "string",    // Custom platform name if platform is empty
      "platform_display": "string",   // Display name for the platform
      "url": "string",                // Video URL
      "title": "string",              // Video title
      "is_featured": "boolean",       // Whether this is the featured video
      "created_at": "datetime"
    }
  ]
}
```

### Video Platform Support
The system automatically detects video platforms from URLs:
- **YouTube**: `youtube.com`, `youtu.be`
- **Vimeo**: `vimeo.com`
- **Facebook**: `facebook.com`
- **Instagram**: `instagram.com`
- **TikTok**: `tiktok.com`
- **Other**: Custom platform name

### Excel Import Video Support
When importing restaurants from Excel, you can map video URL columns:
- `video_url` - Single video URL
- `video_url_1`, `video_url_2`, `video_url_3`, `video_url_4`, `video_url_5` - Multiple video URLs
- Auto-detection of video platform from URL
- Automatic creation of RestaurantVideo objects during import

## Wishlist Management

### Add Restaurant to Wishlist
- **URL**: `/api/restaurants/wishlist/add/`
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "restaurant_id": "integer"
  }
  ```
- **Success Response**: 201 Created
  ```json
  {
    "message": "Restaurant added to wishlist successfully"
  }
  ```
- **Error Response**: 400 Bad Request if restaurant already in wishlist

### Remove Restaurant from Wishlist
- **URL**: `/api/restaurants/wishlist/remove/`
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "restaurant_id": "integer"
  }
  ```
- **Success Response**: 200 OK
  ```json
  {
    "message": "Restaurant removed from wishlist successfully"
  }
  ```

### Get User's Wishlist
- **URL**: `/api/restaurants/wishlist/`
- **Method**: GET
- **Authentication**: Required
- **Description**: Returns full restaurant data for all restaurants in user's wishlist
- **Success Response**: 200 OK
  ```json
  [
    {
      "id": "integer",
      "name": "string",
      "description": "string",
      "full_address": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "primary_phone": "string",
      "primary_email": "string",
      "website": "string",
      "logo": "url|null",
      "venue_types": [{"id": "integer", "name": "string", "code": "string"}],
      "cuisine_styles": [{"id": "integer", "name": "string", "code": "string"}],
      "rating": "decimal|null",
      "review_count": "integer",
      "total_images": "integer",
      "has_operating_hours": "boolean",
      "is_approved": "boolean",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
  ```

## Administrative Endpoints

### Approve Restaurant
- **URL**: `/api/restaurants/{id}/approve/`
- **Method**: POST
- **Authentication**: Required (Staff only)
- **Success Response**: 200 OK
  ```json
  {
    "message": "Restaurant approved successfully"
  }
  ```

### Disapprove Restaurant  
- **URL**: `/api/restaurants/{id}/disapprove/`
- **Method**: POST
- **Authentication**: Required (Staff only)
- **Success Response**: 200 OK
  ```json
  {
    "message": "Restaurant disapproved successfully"
  }
  ```

### Restaurant Statistics
- **URL**: `/api/restaurants/statistics/`
- **Method**: GET
- **Authentication**: Required (Staff only)
- **Success Response**: 200 OK
  ```json
  {
    "total_restaurants": "integer",
    "approved_restaurants": "integer", 
    "pending_approval": "integer",
    "restaurants_by_city": {"city": "count"},
    "restaurants_by_cuisine": {"cuisine": "count"},
    "restaurants_by_venue_type": {"venue_type": "count"}
  }
  ```

## Utility Endpoints

### Check Duplicate
- **URL**: `/api/restaurants/check-duplicate/`
- **Method**: GET/POST
- **Authentication**: Optional
- **Parameters**:
  - `name`: Restaurant name
  - `street_address`: Street address
- **Success Response**: 200 OK
  ```json
  {
    "duplicate": "boolean",
    "matches": ["restaurant objects"]
  }
  ```

### Import Progress
- **URL**: `/api/restaurants/import-progress/`
- **Method**: GET
- **Authentication**: Required
- **Success Response**: 200 OK
  ```json
  {
    "percent": "integer",
    "message": "string"
  }
  ```

## Supporting Data Endpoints

### Get Venue Types
- **URL**: `/api/restaurants/venue-types/`
- **Method**: GET
- **Authentication**: Optional
- **Success Response**: 200 OK
  ```json
  [
    {
      "id": "integer",
      "name": "string",
      "code": "string",
      "description": "string",
      "is_active": "boolean",
      "image": "url|null"
    }
  ]
  ```

### Create Venue Type (Admin Only)
- **URL**: `/api/restaurants/venue-types/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
  ```json
  {
    "name": "string",
    "code": "string",
    "description": "string",
    "is_active": true,
    "image": "file (optional)"
  }
  ```
- **Success Response**: 201 Created (same as GET)

### Get Cuisine Regions
- **URL**: `/api/restaurants/cuisine-regions/`
- **Method**: GET
- **Authentication**: Optional
- **Success Response**: 200 OK
  ```json
  [
    {
      "id": "integer",
      "name": "string",
      "code": "string",
      "description": "string",
      "is_active": "boolean",
      "image": "url|null"
    }
  ]
  ```

### Create Cuisine Region (Admin Only)
- **URL**: `/api/restaurants/cuisine-regions/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
  ```json
  {
    "name": "string",
    "code": "string",
    "description": "string",
    "is_active": true,
    "image": "file (optional)"
  }
  ```
- **Success Response**: 201 Created (same as GET)

### Get Cuisine Subregions
- **URL**: `/api/restaurants/cuisine-subregions/`
- **Method**: GET
- **Authentication**: Optional
- **Success Response**: 200 OK
  ```json
  [
    {
      "id": "integer",
      "name": "string",
      "code": "string",
      "description": "string",
      "is_active": "boolean",
      "region": { "id": "integer", "name": "string", "code": "string" },
      "region_id": "integer",
      "image": "url|null"
    }
  ]
  ```

### Create Cuisine Subregion (Admin Only)
- **URL**: `/api/restaurants/cuisine-subregions/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
  ```json
  {
    "name": "string",
    "code": "string",
    "description": "string",
    "is_active": true,
    "region_id": "integer",
    "image": "file (optional)"
  }
  ```
- **Success Response**: 201 Created (same as GET)

### Get Cuisine Types
- **URL**: `/api/restaurants/cuisine-types/`
- **Method**: GET
- **Authentication**: Optional
- **Success Response**: 200 OK
  ```json
  [
    {
      "id": "integer",
      "name": "string",
      "code": "string",
      "description": "string",
      "is_active": "boolean",
      "region": { "id": "integer", "name": "string", "code": "string" },
      "region_id": "integer",
      "subregion": { "id": "integer", "name": "string", "code": "string", "region": { ... } },
      "subregion_id": "integer",
      "image": "url|null"
    }
  ]
  ```

### Create Cuisine Type (Admin Only)
- **URL**: `/api/restaurants/cuisine-types/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
  ```json
  {
    "name": "string",
    "code": "string",
    "description": "string",
    "is_active": true,
    "region_id": "integer",
    "subregion_id": "integer",
    "image": "file (optional)"
  }
  ```
- **Success Response**: 201 Created (same as GET)

### Get Amenity Super Categories
- **URL**: `/api/restaurants/amenity-super-categories/`
- **Method**: GET
- **Authentication**: Optional
- **Success Response**: 200 OK
```json
[
  {
    "id": "integer",
    "name": "string",
    "code": "string",
    "description": "string",
    "image": "url|null"
  }
]
```

### Create Amenity Super Category (Admin Only)
- **URL**: `/api/restaurants/amenity-super-categories/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
```json
{
  "name": "string",
  "code": "string",
  "description": "string",
  "image": "file (optional)"
}
```
- **Success Response**: 201 Created (same as GET)

### Get Amenity Categories
- **URL**: `/api/restaurants/amenity-categories/`
- **Method**: GET
- **Authentication**: Optional
- **Success Response**: 200 OK
```json
[
  {
    "id": "integer",
    "name": "string",
    "code": "string",
    "description": "string",
    "super_category": {
      "id": "integer",
      "name": "string",
      "code": "string",
      "description": "string",
      "image": "url|null"
    },
    "super_category_id": "integer",
    "image": "url|null"
  }
]
```

### Create Amenity Category (Admin Only)
- **URL**: `/api/restaurants/amenity-categories/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
```json
{
  "name": "string",
  "code": "string",
  "description": "string",
  "super_category_id": "integer",
  "image": "file (optional)"
}
```
- **Success Response**: 201 Created (same as GET)

### Get Amenities
- **URL**: `/api/restaurants/amenities/`
- **Method**: GET
- **Authentication**: Optional
- **Query Parameters**:
  - `category_id`: Filter by category ID
  - `super_category_id`: Filter by super category ID
  - `category_code`: Filter by category code
  - `super_category_code`: Filter by super category code
- **Success Response**: 200 OK
```json
[
  {
    "id": "integer",
    "category": "integer",
    "category_name": "string",
    "super_category": {
      "id": "integer",
      "name": "string",
      "code": "string",
      "description": "string",
      "image": "url|null"
    },
    "name": "string",
    "code": "string",
    "description": "string",
    "is_active": "boolean",
    "image": "url|null"
  }
]
```

### Create Amenity (Admin Only)
- **URL**: `/api/restaurants/amenities/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
```json
{
  "category": "integer",
  "name": "string",
  "code": "string",
  "description": "string",
  "related_names": "string",
  "is_active": true,
  "image": "file (optional)"
}
```
- **Success Response**: 201 Created (same as GET)

**Note:** The `image` field is always optional. If not provided, it will be null in the response.

---

## Utility API Endpoints

### Get Cities
- **URL**: `/api/restaurants/cities/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns a list of all cities where restaurants are located
- **Success Response**: 200 OK
```json
[
  {
    "id": 1,
    "name": "Sydney",
    "state": "NSW",
    "country": "Australia",
    "restaurant_count": 45
  },
  {
    "id": 2,
    "name": "Melbourne",
    "state": "VIC", 
    "country": "Australia",
    "restaurant_count": 38
  }
]
```

### Get Specialities
- **URL**: `/api/restaurants/specialities/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns a list of all restaurant specialities
- **Success Response**: 200 OK
```json
[
  {
    "id": 1,
    "name": "Fine Dining",
    "code": "fine-dining",
    "description": "High-end culinary experiences",
    "is_active": true,
    "image": "url|null"
  },
  {
    "id": 2,
    "name": "Fast Casual",
    "code": "fast-casual", 
    "description": "Quick service with quality ingredients",
    "is_active": true,
    "image": "url|null"
  }
]
```

### Get Service Types
- **URL**: `/api/restaurants/service-types/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns a list of all restaurant service types
- **Success Response**: 200 OK
```json
[
  {
    "id": 1,
    "name": "Table Service",
    "code": "table-service",
    "description": "Full service with waitstaff",
    "is_active": true,
    "image": "url|null"
  },
  {
    "id": 2,
    "name": "Counter Service",
    "code": "counter-service",
    "description": "Order at counter, food brought to table",
    "is_active": true,
    "image": "url|null"
  }
]
```

### Get Menu Types
- **URL**: `/api/restaurants/menu-types/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns a list of all restaurant menu types
- **Success Response**: 200 OK
```json
[
  {
    "id": 1,
    "name": "A la Carte",
    "code": "a-la-carte",
    "description": "Individual item ordering",
    "is_active": true,
    "image": "url|null"
  },
  {
    "id": 2,
    "name": "Set Menu",
    "code": "set-menu",
    "description": "Fixed course meals",
    "is_active": true,
    "image": "url|null"
  }
]
```

### Get Restaurant Icons
- **URL**: `/api/restaurants/restaurant-icons/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns a list of restaurant icons with optional filtering
- **Query Parameters**:
  - `speciality_id`: Filter by speciality ID
  - `cuisine_type_id`: Filter by cuisine type ID
  - `show_default`: Include default icons (default: true)
- **Success Response**: 200 OK
```json
[
  {
    "id": 1,
    "name": "Italian Restaurant Icon",
    "code": "italian-icon",
    "description": "Traditional Italian restaurant icon",
    "speciality": {
      "id": 1,
      "name": "Casual Dining",
      "code": "casual-dining"
    },
    "cuisine_type": {
      "id": 5,
      "name": "Italian",
      "code": "ITALIAN"
    },
    "image": "url",
    "is_default": false,
    "is_active": true
  }
]
```

### Get Gallery Images
- **URL**: `/api/restaurants/gallery-images/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns a list of gallery images with optional filtering
- **Query Parameters**:
  - `speciality_id`: Filter by speciality ID
  - `cuisine_type_id`: Filter by cuisine type ID
- **Success Response**: 200 OK
```json
[
  {
    "id": 1,
    "name": "Modern Restaurant Interior",
    "code": "modern-interior",
    "description": "Contemporary dining space",
    "speciality": {
      "id": 1,
      "name": "Fine Dining",
      "code": "fine-dining"
    },
    "cuisine_type": {
      "id": 5,
      "name": "Italian",
      "code": "ITALIAN"
    },
    "image": "url",
    "is_active": true
  }
]
```

### Get Restaurant Images by Category
- **URL**: `/api/restaurants/restaurant-images-by-category/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns gallery images organized by category with filtering
- **Query Parameters**:
  - `speciality_id`: Filter by speciality ID
  - `cuisine_type_id`: Filter by cuisine type ID (nationality)
  - `restaurant_id`: Filter by restaurant ID
- **Success Response**: 200 OK
```json
{
  "images": [
    {
      "id": 1,
      "name": "Traditional Italian Setting",
      "code": "traditional-italian",
      "description": "Classic Italian restaurant atmosphere",
      "speciality": {
        "id": 1,
        "name": "Fine Dining",
        "code": "fine-dining"
      },
      "cuisine_type": {
        "id": 5,
        "name": "Italian",
        "code": "ITALIAN"
      },
      "image": "url",
      "is_active": true
    }
  ],
  "count": 1,
  "filters_applied": {
    "speciality_id": "1",
    "cuisine_type_id": "5",
    "restaurant_id": null
  }
}
```

## Amenity System Overview

The amenity system has a **3-level hierarchy**:
1. **AmenitySuperCategory** (e.g., "Kids Amenities", "Parking Amenities")
2. **AmenityCategory** (e.g., "Highchairs", "Private Parking") 
3. **Amenity** (e.g., "Highchairs Available", "Free Parking")

### Restaurant Amenities Response Structure
When fetching restaurant details, amenities are returned in a structured format:

```json
"amenities": {
  "selected_amenities": [
    {
      "id": 1,
      "category": 1,
      "category_name": "Highchairs",
      "super_category": {
        "id": 1,
        "name": "Kids Amenities",
        "code": "kids"
      },
      "name": "Highchairs Available",
      "code": "highchairs-available",
      "description": "Highchairs are available for children",
      "is_active": true,
      "image": "url|null"
    }
  ],
  "additional_amenities": "Free parking, Outdoor seating",
  "additional_amenities_list": ["Free parking", "Outdoor seating"],
  "grouped_amenities": [
    {
      "super_category": "Kids Amenities",
      "categories": [
        {
          "category": "Highchairs",
          "amenities": [
            {
              "id": 1,
              "name": "Highchairs Available",
              "code": "highchairs-available",
              "description": "Highchairs are available for children",
              "is_active": true,
              "image": "url|null"
            }
          ]
        }
      ]
    }
  ]
}
```

### Amenity Filtering Examples

#### Get All Amenities for a Specific Category
```
GET /api/restaurants/amenities/?category_code=highchairs
```

#### Get All Amenities for a Super Category
```
GET /api/restaurants/amenities/?super_category_code=kids
```

#### Get All Amenities for a Specific Category ID
```
GET /api/restaurants/amenities/?category_id=1
```

#### Filter Restaurants by Amenities
```
GET /api/restaurants/filter/?amenities[]=highchairs-available&amenity_super_categories[]=parking
```

### Set Restaurant Amenities
- **URL**: `/api/restaurants/{id}/set_amenities/`
- **Method**: POST
- **Authentication**: Required (Restaurant Owner only)
- **Request Body**:
```json
{
  "selected_amenity_ids": [1, 2, 3],
  "additional_amenities": "Free parking, Outdoor seating"
}
```
- **Success Response**: 200 OK
```json
{
  "selected_amenities": [...],
  "additional_amenities": "Free parking, Outdoor seating",
  "additional_amenities_list": ["Free parking", "Outdoor seating"],
  "grouped_amenities": [...]
}
```

## Notes
- All protected endpoints require JWT authentication
- Include the token in the Authorization header:
  ```
  Authorization: Bearer <access_token>
  ```
- Image uploads should be in valid image formats (jpg, png, gif, webp)
- Times should be in 24-hour format (HH:MM:SS)
- Coordinates (latitude/longitude) should be valid decimal values 
- Search and filtering support partial matches (case-insensitive)
- All list endpoints support pagination with `page` parameter
- Error responses include detailed error messages for validation failures
- **Amenity System**: The amenity system uses a 3-level hierarchy (Super Category → Category → Individual Amenity) with support for custom text-based amenities
- **Amenity Filtering**: Restaurants can be filtered by specific amenities or amenity super categories
- **Grouped Amenities**: Restaurant responses include amenities organized by super category and category for easier frontend consumption

# Menu Management API Documentation

## Base URL
All menu endpoints are prefixed with: `/api/menus/`

## Menu Design API

### Get Restaurant Menu Design
- **URL**: `/api/menus/menu-designs/{restaurant_id}/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns the menu design configuration for a specific restaurant
- **Success Response (200 OK)**:
```json
{
  "id": 1,
  "restaurant_id": 123,
  "is_multiple_pricing": true,
  "categories": [
    {"id": 1, "name": "Appetizers"},
    {"id": 2, "name": "Main Courses"},
    {"id": 3, "name": "Desserts"}
  ],
  "pricing_titles": [
    {"id": 1, "name": "Regular Price"},
    {"id": 2, "name": "Members Price"}
  ]
}
```

### Search Default Menu Images
- **URL**: `/api/menus/default-images/search/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Search for default menu images by name or description
- **Query Parameters**:
  - `name`: Search by cuisine name
  - `description`: Search by description
- **Success Response (200 OK)**:
```json
{
  "results": [
    {
      "id": 1,
      "name": "Italian",
      "description": "Traditional Italian cuisine",
      "related_names": "pasta, pizza, risotto",
      "image_url": "https://example.com/media/default_images/italian.jpg"
    }
  ]
}
```

## Restaurant Menu Items API

### Get Restaurant Menu Items
- **URL**: `/api/menus/restaurants/{restaurant_id}/menu-items/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns all menu items for a specific restaurant
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "Margherita Pizza",
      "description": "Classic tomato sauce with mozzarella cheese",
      "spice_level": {
        "id": 1,
        "name": "Mild",
        "code": "mild"
      },
      "dietary_requirements": [
        {"id": 1, "name": "Vegetarian", "code": "vegetarian"}
      ],
      "religious_restrictions": [],
      "allergens": [
        {"id": 1, "name": "Dairy", "code": "dairy"}
      ],
      "category": {
        "id": 1,
        "name": "Pizzas"
      },
      "portions": [
        {
          "id": 1,
          "portion_size": {
            "id": 1,
            "name": "Regular",
            "code": "regular"
          },
          "pricing_titles": [
            {
              "id": 1,
              "name": "Regular Price",
              "code": "regular",
              "price": "15.99"
            },
            {
              "id": 2,
              "name": "Members Price",
              "code": "members",
              "price": "13.99"
            }
          ]
        }
      ],
      "display_order": 1,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:45:00Z"
    }
  ]
  ```

### Get Specific Menu Item
- **URL**: `/api/menus/restaurants/{restaurant_id}/menu-items/{item_id}/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns a specific menu item for a restaurant
- **Success Response (200 OK)**: Same structure as above but single object
- **Error Response (404 Not Found)**: Menu item not found

### Create Menu Item
- **URL**: `/api/menus/restaurants/{restaurant_id}/menu-items/`
- **Method**: POST
- **Authentication**: Required (Restaurant Owner only)
- **Content-Type**: application/json
- **Request Body**:
  ```json
  {
    "name": "Margherita Pizza",
    "description": "Classic tomato sauce with mozzarella cheese",
    "spice_level_id": 1,
    "category_id": 1,
    "display_order": 1,
    "is_active": true,
    "dietary_requirement_ids": [1, 2],
    "religious_restriction_ids": [],
    "allergen_ids": [1, 3],
    "portions": [
      {
        "portion_size_id": 1,
        "pricing": [
          {
            "pricing_title_id": 1,
            "price": "15.99"
          },
          {
            "pricing_title_id": 2,
            "price": "13.99"
          }
        ]
      }
    ]
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "id": 1,
    "message": "Menu item created successfully"
  }
  ```
- **Error Response (500 Internal Server Error)**:
  ```json
  {
    "error": "Error message details"
  }
  ```

### Update Menu Item
- **URL**: `/api/menus/restaurants/{restaurant_id}/menu-items/{item_id}/`
- **Method**: PUT
- **Authentication**: Required (Restaurant Owner only)
- **Content-Type**: application/json
- **Request Body**: Same as Create Menu Item
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Menu item updated successfully"
  }
  ```
- **Error Responses**:
  - **404 Not Found**: Menu item not found
  - **500 Internal Server Error**: Update failed

### Delete Menu Item
- **URL**: `/api/menus/restaurants/{restaurant_id}/menu-items/{item_id}/`
- **Method**: DELETE
- **Authentication**: Required (Restaurant Owner only)
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Menu item deleted successfully"
  }
  ```
- **Error Responses**:
  - **404 Not Found**: Menu item not found
  - **500 Internal Server Error**: Delete failed

---

## Menu Categories API

### List Menu Categories
GET /api/menus/categories/

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "name": "Banquets",
    "code": "banquets",
    "description": "Special group dining options for events and celebrations",
    "special_notes": "Minimum 10 people required. Please book 48 hours in advance.",
    "is_active": true,
    "is_default": false,
    "image": "https://example.com/media/menu_category_images/banquets.jpg"
  }
]
```

### Get Single Menu Category
GET /api/menus/categories/{category_id}/

**Response (200 OK)**
```json
{
  "id": 1,
  "name": "Banquets",
  "code": "banquets",
  "description": "Special group dining options for events and celebrations",
  "special_notes": "Minimum 10 people required. Please book 48 hours in advance.",
  "is_active": true,
  "is_default": false,
  "image": "https://example.com/media/menu_category_images/banquets.jpg"
}
```

### Create Menu Category (Admin Only)
- **URL**: `/api/menus/categories/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
```json
{
  "name": "Banquets",
  "code": "banquets",
  "description": "Special group dining options for events and celebrations",
  "special_notes": "Minimum 10 people required. Please book 48 hours in advance.",
  "is_active": true,
  "is_default": false,
  "image": "file (optional)"
}
```
- **Success Response (200 OK)**:
```json
{"id": 1}
```

---

## Pricing Titles API

### List Pricing Titles
GET /api/menus/pricing-titles/

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "name": "Members",
    "code": "members",
    "description": "Special pricing for registered members",
    "display_order": 1,
    "is_active": true,
    "is_default": false,
    "image": "https://example.com/media/pricing_title_images/members.jpg"
  }
]
```

### Get Single Pricing Title
GET /api/menus/pricing-titles/{title_id}/

**Response (200 OK)**
```json
{
  "id": 1,
  "name": "Members",
  "code": "members",
  "description": "Special pricing for registered members",
  "display_order": 1,
  "is_active": true,
  "is_default": false,
  "image": "https://example.com/media/pricing_title_images/members.jpg"
}
```

### Create Pricing Title (Admin Only)
- **URL**: `/api/menus/pricing-titles/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
```json
{
  "name": "Members",
  "code": "members",
  "description": "Special pricing for registered members",
  "display_order": 1,
  "is_active": true,
  "is_default": false,
  "image": "file (optional)"
}
```
- **Success Response (200 OK)**:
```json
{"id": 1}
```

---

## Allergens API

### List Allergens
GET /api/menus/allergens/

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "name": "Peanuts",
    "code": "peanuts",
    "description": "Contains peanuts",
    "is_active": true,
    "image": "https://example.com/media/allergen_images/peanuts.jpg"
  }
]
```

### Get Single Allergen
GET /api/menus/allergens/{allergen_id}/

**Response (200 OK)**
```json
{
  "id": 1,
  "name": "Peanuts",
  "code": "peanuts",
  "description": "Contains peanuts",
  "is_active": true,
  "image": "https://example.com/media/allergen_images/peanuts.jpg"
}
```

### Create Allergen (Admin Only)
- **URL**: `/api/menus/allergens/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
```json
{
  "name": "Peanuts",
  "code": "peanuts",
  "description": "Contains peanuts",
  "is_active": true,
  "image": "file (optional)"
}
```
- **Success Response (200 OK)**:
```json
{"id": 1}
```

---

## Dietary Requirements API

### List Dietary Requirements
GET /api/menus/dietary-requirements/

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "name": "Vegetarian",
    "code": "vegetarian",
    "description": "No meat or fish",
    "display_order": 1,
    "is_active": true,
    "image": "https://example.com/media/dietary_requirement_images/vegetarian.jpg"
  }
]
```

### Get Single Dietary Requirement
GET /api/menus/dietary-requirements/{req_id}/

**Response (200 OK)**
```json
{
  "id": 1,
  "name": "Vegetarian",
  "code": "vegetarian",
  "description": "No meat or fish",
  "display_order": 1,
  "is_active": true,
  "image": "https://example.com/media/dietary_requirement_images/vegetarian.jpg"
}
```

### Create Dietary Requirement (Admin Only)
- **URL**: `/api/menus/dietary-requirements/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
```json
{
  "name": "Vegetarian",
  "code": "vegetarian",
  "description": "No meat or fish",
  "display_order": 1,
  "is_active": true,
  "image": "file (optional)"
}
```
- **Success Response (200 OK)**:
```json
{"id": 1}
```

---

## Portion Sizes API

### List Portion Sizes
GET /api/menus/portion-sizes/

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "name": "Large",
    "code": "large",
    "description": "Large size",
    "display_order": 1,
    "is_active": true,
    "image": "https://example.com/media/portion_size_images/large.jpg"
  }
]
```

### Get Single Portion Size
GET /api/menus/portion-sizes/{portion_id}/

**Response (200 OK)**
```json
{
  "id": 1,
  "name": "Large",
  "code": "large",
  "description": "Large size",
  "display_order": 1,
  "is_active": true,
  "image": "https://example.com/media/portion_size_images/large.jpg"
}
```

### Create Portion Size (Admin Only)
- **URL**: `/api/menus/portion-sizes/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
```json
{
  "name": "Large",
  "code": "large",
  "description": "Large size",
  "display_order": 1,
  "is_active": true,
  "image": "file (optional)"
}
```
- **Success Response (200 OK)**:
```json
{"id": 1}
```

---

## Religious Restrictions API

### List Religious Restrictions
GET /api/menus/religious-restrictions/

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "name": "Halal",
    "code": "halal",
    "description": "Permitted by Islamic law",
    "is_active": true,
    "image": "https://example.com/media/religious_restriction_images/halal.jpg"
  }
]
```

### Get Single Religious Restriction
GET /api/menus/religious-restrictions/{rel_id}/

**Response (200 OK)**
```json
{
  "id": 1,
  "name": "Halal",
  "code": "halal",
  "description": "Permitted by Islamic law",
  "is_active": true,
  "image": "https://example.com/media/religious_restriction_images/halal.jpg"
}
```

### Create Religious Restriction (Admin Only)
- **URL**: `/api/menus/religious-restrictions/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
```json
{
  "name": "Halal",
  "code": "halal",
  "description": "Permitted by Islamic law",
  "is_active": true,
  "image": "file (optional)"
}
```
- **Success Response (200 OK)**:
```json
{"id": 1}
```

---

## Spice Levels API

### List Spice Levels
GET /api/menus/spice-levels/

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "name": "Mild",
    "code": "mild",
    "description": "Not spicy",
    "display_order": 1,
    "is_active": true,
    "image": "https://example.com/media/spice_level_images/mild.jpg"
  }
]
```

### Get Single Spice Level
GET /api/menus/spice-levels/{spice_id}/

**Response (200 OK)**
```json
{
  "id": 1,
  "name": "Mild",
  "code": "mild",
  "description": "Not spicy",
  "display_order": 1,
  "is_active": true,
  "image": "https://example.com/media/spice_level_images/mild.jpg"
}
```

### Create Spice Level (Admin Only)
- **URL**: `/api/menus/spice-levels/`
- **Method**: POST
- **Authentication**: Admin required
- **Content-Type**: multipart/form-data
- **Request Body**:
```json
{
  "name": "Mild",
  "code": "mild",
  "description": "Not spicy",
  "display_order": 1,
  "is_active": true,
  "image": "file (optional)"
}
```
- **Success Response (200 OK)**:
```json
{"id": 1}
```

---

**Note:** The `image` field is always optional. If not provided, it will be `null` in the response.

---

## Menu Items Features

The restaurant menu items API supports the following features:

### Menu Item Structure
- **Basic Information**: Name, description, category, display order
- **Spice Levels**: Mild, Medium, Hot, etc.
- **Dietary Requirements**: Vegetarian, Vegan, Gluten-free, etc.
- **Religious Restrictions**: Halal, Kosher, etc.
- **Allergens**: Dairy, Nuts, Shellfish, etc.
- **Portion Sizes**: Small, Regular, Large, etc.
- **Multiple Pricing Tiers**: Regular price, Members price, etc.

### Pricing Structure
Each menu item can have multiple portions (sizes), and each portion can have multiple pricing tiers:
```json
"portions": [
  {
    "portion_size": {"id": 1, "name": "Regular", "code": "regular"},
    "pricing_titles": [
      {"name": "Regular Price", "price": "15.99"},
      {"name": "Members Price", "price": "13.99"}
    ]
  },
  {
    "portion_size": {"id": 2, "name": "Large", "code": "large"},
    "pricing_titles": [
      {"name": "Regular Price", "price": "18.99"},
      {"name": "Members Price", "price": "16.99"}
    ]
  }
]
```

### Authentication Requirements
- **GET endpoints**: No authentication required (public access)
- **POST/PUT/DELETE endpoints**: Restaurant owner authentication required
- **Admin endpoints**: Admin authentication required for category management

# Reviews API Documentation

## Review Categories

### List Review Categories
- **URL**: `/api/review-categories/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns a list of all active review categories.
- **Success Response**:
  ```json
  [
    { "id": 1, "name": "Food", "description": "Quality of food", "is_active": true },
    { "id": 2, "name": "Service", "description": "Staff and service", "is_active": true }
  ]
  ```

### Create Review Category (Admin Only)
- **URL**: `/api/review-categories/`
- **Method**: POST
- **Authentication**: Admin required
- **Request Body**:
  ```json
  { "name": "Ambience", "description": "Atmosphere and decor", "is_active": true }
  ```
- **Success Response**: 201 Created
- **Error Response**: 400 Bad Request

### Update Review Category (Admin Only)
- **URL**: `/api/review-categories/{id}/`
- **Method**: PUT
- **Authentication**: Admin required
- **Request Body**:
  ```json
  { "name": "Ambience", "description": "Updated desc", "is_active": false }
  ```
- **Success Response**: 200 OK
- **Error Response**: 400 Bad Request

### Delete Review Category (Admin Only)
- **URL**: `/api/review-categories/{id}/`
- **Method**: DELETE
- **Authentication**: Admin required
- **Success Response**: 204 No Content

---

## Reviews

### Submit Review
- **URL**: `/api/restaurants/{id}/reviews/add/`
- **Method**: POST
- **Authentication**: Required
- **Content-Type**: application/json OR multipart/form-data

#### For JSON Submission (without photos):
- **Content-Type**: application/json
- **Request Body**:
  ```json
  {
    "overall_rating": 4,
    "comment": "Great food, slow service.",
    "category_ratings": [
      { "category_id": 1, "rating": 5 },
      { "category_id": 2, "rating": 3 }
    ]
  }
  ```

#### For Multipart Submission (with photos):
- **Content-Type**: multipart/form-data
- **Multiple Photos Supported**: Yes (up to multiple files)
- **FormData Structure**:
  ```javascript
  const formData = new FormData();
  formData.append('overall_rating', 4);
  formData.append('comment', 'Great food, slow service.');
  formData.append('category_ratings', JSON.stringify([
    { "category_id": 1, "rating": 5 },
    { "category_id": 2, "rating": 3 }
  ]));
  
  // Multiple photos
  formData.append('photos', file1);  // First photo
  formData.append('photos', file2);  // Second photo  
  formData.append('photos', file3);  // Third photo
  ```

- **Success Response**: 201 Created
- **Error Response**: 400 Bad Request

### List Reviews
- **URL**: `/api/restaurants/{id}/reviews/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns reviews with per-category ratings.
- **Success Response**:
  ```json
  [
    {
      "id": 123,
      "user": { "id": 1, "username": "john" },
      "overall_rating": 4,
      "comment": "Great food, slow service.",
      "category_ratings": [
        { "category": { "id": 1, "name": "Food" }, "rating": 5 },
        { "category": { "id": 2, "name": "Service" }, "rating": 3 }
      ],
      "photos": [ "url1", "url2" ],
      "created_at": "2024-06-01T12:00:00Z",
      "owner_response": "Thank you for your feedback!"
    }
  ]
  ```

### Get User's Reviews
- **URL**: `/api/reviews/my-reviews/`
- **Method**: GET
- **Authentication**: Required
- **Description**: Returns all reviews submitted by the authenticated user, ordered by most recent first.
- **Success Response**: 
  ```json
  [
    {
      "id": 123,
      "restaurant": {
        "id": 92962,
        "name": "Mario's Pizzeria"
      },
      "overall_rating": 4,
      "comment": "Great food, slow service.",
      "category_ratings": [
        { "category": { "id": 1, "name": "Food" }, "rating": 5 },
        { "category": { "id": 2, "name": "Service" }, "rating": 3 }
      ],
      "photos": [
        {
          "id": 456,
          "image": "https://example.com/media/review_photos/photo1.jpg"
        }
      ],
      "created_at": "2024-06-01T12:00:00Z",
      "updated_at": "2024-06-01T12:00:00Z",
      "owner_response": "Thank you for your feedback!"
    }
  ]
  ```
- **Error Response**: 401 Unauthorized if not authenticated

### Edit Review
- **URL**: `/api/reviews/{id}/edit/`
- **Method**: PUT
- **Authentication**: Required
- **Content-Type**: application/json OR multipart/form-data

#### For JSON Update (text/ratings only - keeps existing photos):
```json
{
  "overall_rating": 5,
  "comment": "Updated comment",
  "category_ratings": [
    { "category_id": 1, "rating": 5 },
    { "category_id": 2, "rating": 4 }
  ]
}
```

#### For Multipart Update (with new photos - replaces all photos):
- **Multiple Photos Supported**: Yes
- **Photo Behavior**: Providing new photos will replace ALL existing photos
- **FormData Structure**: Same as submission (see above)

- **Success Response**: 200 OK
- **Error Response**: 400 Bad Request

### Delete Review
- **URL**: `/api/reviews/{id}/delete/`
- **Method**: DELETE
- **Authentication**: Required
- **Success Response**: 204 No Content

### Flag Review
- **URL**: `/api/reviews/{id}/flag/`
- **Method**: POST
- **Authentication**: Required
- **Request Body**:
  ```json
  { "reason": "Spam", "details": "Contains offensive language" }
  ```
- **Success Response**: 200 OK

### Owner Respond to Review
- **URL**: `/api/reviews/{id}/respond/`
- **Method**: POST
- **Authentication**: Restaurant Owner required
- **Request Body**:
  ```json
  { "response": "Thank you for your feedback!" }
  ```
- **Success Response**: 200 OK

---

## Review Analytics

### Get Review Analytics
- **URL**: `/api/restaurants/{id}/reviews/analytics/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns average per-category ratings, overall rating, trends, etc.
- **Success Response**:
  ```json
  {
    "overall_average": 4.2,
    "category_averages": [
      { "category": { "id": 1, "name": "Food" }, "average": 4.5 },
      { "category": { "id": 2, "name": "Service" }, "average": 3.9 }
    ],
    "total_reviews": 120
  }
  ```

---

## Notes
- All review forms must fetch categories dynamically.
- Category management endpoints are admin-only.
- All review endpoints require authentication except for listing and analytics.
- Category ratings are required for all active categories at the time of review submission.
- Reviews can be for restaurants or menu items (extend endpoints as needed). 

# Frontend Implementation Guidelines: Category-Based Reviews

## 1. Dynamic Category Handling
- Always fetch review categories from `/api/review-categories/` before rendering the review form.
- Do not hardcode category names or IDs; render star rating inputs for each active category.

## 2. Review Submission Form
- Render a star rating input (1–5) for each category.
- Include an optional overall rating and a comment box (with character counter).
- Allow photo uploads (validate file types and size).
- Disable the submit button until all required fields are filled.

## 3. Review List/Display
- Show per-category ratings and overall rating for each review.
- Display user info, date, comment, photos, and owner response if present.
- Allow sorting/filtering by date, rating, or category.

## 4. Review Actions
- Allow users to edit/delete their own reviews.
- Allow users to flag/report inappropriate reviews.
- Optionally, allow upvoting/downvoting reviews.

## 5. Owner/Admin Actions
- Owners can respond to reviews via a reply form.
- Admins can manage categories and moderate reviews via admin panel.

## 6. API Integration
- Use the documented endpoints for all review-related actions.
- Handle API errors gracefully and show clear feedback to users.

## 7. UX Best Practices
- Use accessible star rating components.
- Show loading indicators when fetching categories or submitting reviews.
- Provide success/error messages after actions.
- Use optimistic UI updates where appropriate.

## 8. Example User Flow
- User clicks "Write a Review" → Fetch categories → Render form → Submit review → Show in list.

## 9. Testing
- Test with different category sets (admin may add/remove categories).
- Test all review actions (submit, edit, delete, flag, respond). 

# Subscription Plans API

## Base URL
All subscription endpoints are prefixed with: `/api/subscriptions/`

## Plan Features

### List Features
- **URL**: `/api/subscriptions/features/`
- **Method**: GET
- **Description**: Returns a list of all available plan features.
- **Success Response**:
```json
[
  { "id": 1, "name": "Priority Support", "description": "24/7 support for premium users." },
  { "id": 2, "name": "Custom Branding", "description": "Add your own logo and colors." }
]
```

### Get Feature Details
- **URL**: `/api/subscriptions/features/{id}/`
- **Method**: GET
- **Description**: Returns details of a specific feature.
- **Success Response**:
```json
{ "id": 1, "name": "Priority Support", "description": "24/7 support for premium users." }
```

---

## Subscription Plans

### List Subscription Plans
- **URL**: `/api/subscriptions/plans/`
- **Method**: GET
- **Description**: Returns a list of all subscription plans, including plan type (as a dropdown value) and features.
- **Success Response**:
```json
[
  {
    "id": 1,
    "name": "Pro Owner Plan",
    "description": "Best for growing restaurants.",
    "price": "49.99",
    "billing_cycle": "monthly",
    "plan_type": "Restaurant Owner",
    "features": [
      { "id": 1, "name": "Priority Support", "description": "24/7 support for premium users." },
      { "id": 2, "name": "Custom Branding", "description": "Add your own logo and colors." }
    ]
  },
  {
    "id": 2,
    "name": "Customer Gold",
    "description": "Unlock exclusive deals.",
    "price": "9.99",
    "billing_cycle": "monthly",
    "plan_type": "Customer",
    "features": [
      { "id": 3, "name": "Exclusive Offers", "description": "Access to members-only deals." }
    ]
  }
]
```

### Get Subscription Plan Details
- **URL**: `/api/subscriptions/plans/{id}/`
- **Method**: GET
- **Description**: Returns details of a specific subscription plan, including plan type (as a dropdown value) and features.
- **Success Response**:
```json
{
  "id": 1,
  "name": "Pro Owner Plan",
  "description": "Best for growing restaurants.",
  "price": "49.99",
  "billing_cycle": "monthly",
  "plan_type": "Restaurant Owner",
  "features": [
    { "id": 1, "name": "Priority Support", "description": "24/7 support for premium users." },
    { "id": 2, "name": "Custom Branding", "description": "Add your own logo and colors." }
  ]
}
```

---

## Notes
- The `plan_type` field in Subscription Plans is a dropdown with only two possible values: `"Restaurant Owner"` and `"Customer"`.
- All endpoints support standard DRF pagination and filtering if enabled.
- Only listing and detail endpoints are documented here. For create/update/delete, see future documentation updates.
- Authentication may be required depending on your project settings. 

## Amenity Super Categories API

### List Amenity Super Categories
- **URL**: `/api/restaurants/amenity-super-categories/`
- **Method**: GET
- **Authentication**: Optional
- **Success Response**: 200 OK
```json
[
  {
    "id": 1,
    "name": "Kids Amenities",
    "code": "kids",
    "description": "Amenities for children",
  },
  {
    "id": 2,
    "name": "Parking Amenities",
    "code": "parking",
    "description": "Parking related amenities"
  }
]
```

### Create Amenity Super Category (Admin Only)
- **URL**: `/api/restaurants/amenity-super-categories/`
- **Method**: POST
- **Authentication**: Admin required
- **Request Body**:
```json
{
  "name": "Special Amenities",
  "code": "special",
  "description": "Special features and offers"
}
```
- **Success Response**: 201 Created
- **Error Response**: 400 Bad Request

---

## Amenity Categories API (Updated)

### List Amenity Categories
- **URL**: `/api/restaurants/amenity-categories/`
- **Method**: GET
- **Authentication**: Optional
- **Success Response**: 200 OK
```json
[
  {
    "id": 1,
    "name": "Highchairs",
    "code": "highchairs",
    "description": "Highchairs for kids",
    "super_category": {
      "id": 1,
      "name": "Kids Amenities",
      "code": "kids",
      "description": "Amenities for children"
    },
    "super_category_id": 1
  }
]
```

### Create Amenity Category (Admin Only)
- **URL**: `/api/restaurants/amenity-categories/`
- **Method**: POST
- **Authentication**: Admin required
- **Request Body**:
```json
{
  "name": "Private Parking",
  "code": "private-parking",
  "description": "Private parking available",
  "super_category_id": 2
}
```
- **Success Response**: 201 Created
- **Error Response**: 400 Bad Request

---

## Restaurant Management API (Updated)

### List Restaurants / Get Restaurant Details (Amenities Grouped)
- **Field in Response**:
```json
"amenities": {
  "selected_amenities": [ ... ],
  "grouped_amenities": [
    {
      "super_category": "Kids Amenities",
      "categories": [
        {
          "category": "Highchairs",
          "amenities": [
            { "id": 1, "name": "Highchairs", ... }
          ]
        }
      ]
    },
    {
      "super_category": "Parking Amenities",
      "categories": [ ... ]
    }
  ],
  ...
}
```

### Filter Restaurants (Updated)
- **URL**: `/api/restaurants/filter/`
- **Method**: GET
- **Query Parameters** (add):
  - `amenity_super_categories[]`: Array of amenity super category codes
  - `amenities[]`: Array of amenity codes (existing)
- **Example**:
```
GET /api/restaurants/filter/?amenity_super_categories[]=kids&amenity_super_categories[]=parking
```
- **Success Response**: 200 OK (filtered results)

### Search & Discovery Endpoints (Updated)
- **URL**: `/api/restaurants/search/`
- **Method**: GET
- **Query Parameters** (add):
  - `amenity_super_categories[]`: Array of amenity super category codes

---

## Location-Based Restaurant Search APIs

### 1. Nearby Restaurants (Enhanced)
Find restaurants near user's current location using coordinates.

- **URL**: `/api/restaurants/nearby/`
- **Method**: GET
- **Query Parameters**:
  - `lat` (required): User's latitude (decimal degrees)
  - `lon` (required): User's longitude (decimal degrees)
  - `radius` (optional): Search radius in km (default: 10km, max: 100km)
  - `unit` (optional): Distance unit - 'km', 'mi', 'm' (default: 'km')
  - `cuisine` (optional): Filter by cuisine type code
  - `venue_type` (optional): Filter by venue type code
  - `amenities[]` (optional): Filter by amenity codes
  - `min_rating` (optional): Minimum average rating (1-5)
  - `sort` (optional): Sort by 'distance', 'rating', 'name' (default: 'distance')
  - `limit` (optional): Limit number of results (default: 50, max: 200)

- **Example Request**:
```
GET /api/restaurants/nearby/?lat=37.7749&lon=-122.4194&radius=5&unit=km&cuisine=ITALIAN&sort=distance&limit=20
```

- **Success Response**: 200 OK
```json
{
  "count": 15,
  "search_params": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radius": 5,
    "unit": "km",
    "filters": {
      "cuisine": "ITALIAN",
      "venue_type": null,
      "amenities": null,
      "min_rating": null
    },
    "sort": "distance",
    "limit": 20
  },
  "results": [
    {
      "id": 123,
      "name": "Mario's Pizzeria",
      "description": "Authentic Italian pizza and pasta",
      "full_address": "123 Main St, San Francisco, CA 94102",
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "primary_phone": "+1-555-123-4567",
      "primary_email": "info@mariospizza.com",
      "website": "https://mariospizza.com",
      "logo": "https://example.com/media/restaurant_logos/marios.jpg",
      "featured_video": {
        "id": 456,
        "platform": "YouTube",
        "platform_display": "YouTube",
        "url": "https://www.youtube.com/watch?v=example",
        "title": "Mario's Pizzeria - Our Story",
        "is_featured": true
      },
      "venue_types": [
        {
          "id": 1,
          "name": "Casual Dining",
          "code": "CASUAL"
        }
      ],
      "cuisine_styles": [
        {
          "id": 5,
          "name": "Italian",
          "code": "ITALIAN"
        }
      ],
      "distance": 1.25,
      "distance_unit": "km",
      "distance_km": 1.25,
      "coordinates": {
        "latitude": 37.7849,
        "longitude": -122.4094
      },
      "is_approved": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

- **Error Responses**:
  - **400 Bad Request**: Missing or invalid parameters
  ```json
  {
    "error": "Both lat and lon parameters are required"
  }
  ```
  ```json
  {
    "error": "Latitude must be between -90 and 90"
  }
  ```

### 2. Search by Location Name
Search restaurants by location name (city, address, postal code, etc.)

- **URL**: `/api/restaurants/search_by_location/`
- **Method**: GET
- **Query Parameters**:
  - `location` (required): Location search term (city, address, postal code, etc.)
  - `radius` (optional): Search radius around the location in km (default: 10km)
  - `user_lat` (optional): User's latitude for distance calculation
  - `user_lon` (optional): User's longitude for distance calculation
  - `cuisine` (optional): Filter by cuisine type code
  - `venue_type` (optional): Filter by venue type code
  - `limit` (optional): Limit number of results (default: 50, max: 200)

- **Example Request**:
```
GET /api/restaurants/search_by_location/?location=San Francisco&user_lat=37.7749&user_lon=-122.4194&cuisine=CHINESE&limit=10
```

- **Success Response**: 200 OK
```json
{
  "count": 8,
  "search_params": {
    "location": "San Francisco",
    "radius": 10,
    "user_coordinates": {
      "latitude": "37.7749",
      "longitude": "-122.4194"
    },
    "filters": {
      "cuisine": "CHINESE",
      "venue_type": null
    }
  },
  "results": [
    {
      "id": 456,
      "name": "Golden Dragon Restaurant",
      "description": "Traditional Cantonese cuisine",
      "full_address": "789 Grant Ave, San Francisco, CA 94108",
      "city": "San Francisco",
      "state": "CA",
      "distance": 2.1,
      "distance_unit": "km",
      "coordinates": {
        "latitude": 37.7949,
        "longitude": -122.4064
      },
      "cuisine_styles": [
        {
          "id": 3,
          "name": "Chinese",
          "code": "CHINESE"
        }
      ]
    }
  ]
}
```

- **Error Response**:
  - **400 Bad Request**: Missing location parameter
  ```json
  {
    "error": "Location parameter is required"
  }
  ```

### 3. Location-Based Features

#### Distance Calculation
All location-based endpoints use the Haversine formula for accurate distance calculations between two geographical points.

#### Performance Optimizations
- **Bounding Box Filtering**: Initial database filtering uses a calculated bounding box to reduce the dataset before precise distance calculations
- **Coordinate Validation**: Input coordinates are validated for proper latitude (-90 to 90) and longitude (-180 to 180) ranges
- **Error Handling**: Restaurants with invalid or missing coordinates are gracefully skipped

#### Supported Distance Units
- **km**: Kilometers (default)
- **mi**: Miles 
- **m**: Meters

#### Sort Options
- **distance**: Sort by proximity to user location (default)
- **name**: Sort alphabetically by restaurant name
- **rating**: Sort by average rating (when available)

---

---

## Autocomplete Search API

### Search Suggestions
Provides real-time search suggestions across multiple entity types for frontend autocomplete functionality.

- **URL**: `/api/restaurants/autocomplete/`
- **Method**: GET
- **Authentication**: Optional
- **Description**: Returns categorized search suggestions for restaurants, venue types, cuisine types, amenities, and menu items based on user input
- **Caching**: 15-minute response cache for optimal performance
- **Performance**: Sub-200ms response times with database-level optimizations

#### Query Parameters:
- `query` (required): Search term (minimum 2 characters)
- `limit` (optional): Maximum results per category (default: 10, max: 50)

#### Example Request:
```
GET /api/restaurants/autocomplete/?query=pizza&limit=5
```

#### Success Response (200 OK):
```json
{
  "query": "pizza",
  "suggestions": {
    "restaurants": [
      {
        "id": 123,
        "name": "Mario's Pizza Palace"
      },
      {
        "id": 456,
        "name": "Artisan Pizza Co"
      }
    ],
    "venue_types": [
      {
        "id": 15,
        "name": "Pizza Restaurant",
        "code": "pizza-restaurant"
      }
    ],
    "cuisine_types": [
      {
        "id": 8,
        "name": "Italian",
        "code": "ITALIAN"
      }
    ],
    "amenities": [
      {
        "id": 102,
        "name": "Wood-fired Pizza Oven",
        "code": "wood-fired-oven",
        "category__name": "Kitchen Features"
      }
    ],
    "menu_items": [
      {
        "id": 789,
        "name": "Margherita Pizza",
        "description": "Classic tomato sauce with mozzarella cheese",
        "restaurant__name": "Mario's Pizza Palace",
        "restaurant__id": 123,
        "menu_design_category__category__name": "Main Courses",
        "menu_design_category__category__code": "main-courses"
      }
    ]
  },
  "total_results": 8,
  "performance_note": "Found 8 suggestions across 5 categories"
}
```

#### Response for Short Query (< 2 characters):
```json
{
  "query": "p",
  "suggestions": {
    "restaurants": [],
    "amenities": [],
    "venue_types": [],
    "cuisine_types": [],
    "menu_items": []
  },
  "total_results": 0
}
```

#### Error Response (500 Internal Server Error):
```json
{
  "error": "Autocomplete search failed: Database connection error",
  "query": "pizza",
  "suggestions": {
    "restaurants": [],
    "amenities": [],
    "venue_types": [],
    "cuisine_types": [],
    "menu_items": []
  },
  "total_results": 0
}
```

#### Implementation Details:
- **Search Scope**: 
  - Restaurants: Only approved and original (non-duplicate) restaurants
  - Venue Types: Only active venue types
  - Cuisine Types: Only active cuisine types  
  - Amenities: Only active amenities with category information
  - Menu Items: Only active menu items from approved restaurants
- **Search Method**: Case-insensitive partial matching (`icontains`)
- **Ordering**: Alphabetical by name within each category
- **Performance**: Database-level filtering and early query termination

#### Frontend Integration:
```javascript
// Example usage with debouncing
const fetchSuggestions = useCallback(
  debounce(async (query) => {
    if (query.length < 2) return;
    
    const response = await fetch(
      `/api/restaurants/autocomplete/?query=${encodeURIComponent(query)}&limit=5`
    );
    const data = await response.json();
    setSuggestions(data.suggestions);
  }, 300),
  []
);
```

#### Use Cases:
- **Restaurant Search**: Direct navigation to specific restaurants
- **Filter Application**: Apply venue type, cuisine, or amenity filters
- **Search Enhancement**: Improve search experience with intelligent suggestions
- **Discovery**: Help users discover relevant categories and amenities
- **Menu Item Search**: Find specific dishes across restaurants

---

## Notes (Updated)
- Amenities are now grouped by super category and subcategory in API responses.
- You can filter/search restaurants by amenity super category and/or amenity category.
- Location-based search APIs provide efficient restaurant discovery using user coordinates or location names.
- Distance calculations use the Haversine formula for geographical accuracy.
- All location-based endpoints include performance optimizations for large datasets.
- **Autocomplete API**: Provides real-time search suggestions across 5 entity types (restaurants, venue types, cuisine types, amenities, menu items) with sub-200ms performance and 15-minute caching for optimal user experience.
- **Utility APIs**: Additional endpoints for cities, specialities, service types, menu types, restaurant icons, and gallery images provide comprehensive data access.
- **Menu APIs**: All menu-related endpoints use the NinjaAPI framework and support comprehensive menu item management with pricing, portions, dietary requirements, allergens, and religious restrictions.
- **Base URLs**: 
  - Development: `http://127.0.0.1:8000` or `http://localhost:8000`
  - Production: `http://35.92.149.12` or `https://restaurantreviews.io` 