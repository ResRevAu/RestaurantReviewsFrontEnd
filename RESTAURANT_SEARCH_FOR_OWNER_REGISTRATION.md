# Restaurant Search API for Owner Registration

## Overview
This document provides API suggestions for searching restaurants during restaurant owner registration. The API should display restaurant names, pictures (logos), and addresses as suggestions, allowing users to select one restaurant while registering as a restaurant owner.

---

## Current API Analysis

### 1. Existing Autocomplete API
**Endpoint**: `/api/restaurants/autocomplete/`
- **Current Response**: Returns only `id` and `name` for restaurants
- **Limitation**: Does not include pictures or addresses
- **Use Case**: General search across multiple entity types

### 2. Restaurant List/Search API
**Endpoint**: `/api/restaurants/`
- **Query Parameters**: `search`, `page`, filters, etc.
- **Response**: Full restaurant details including logo, address, etc.
- **Limitation**: Returns too much data (pagination, full objects, nested relations)
- **Use Case**: Full restaurant listing and detailed search

---

## Recommended Solution

### Option 1: Create New Dedicated Endpoint (RECOMMENDED)
Create a lightweight endpoint specifically for restaurant owner registration that returns only essential fields.

**Endpoint**: `/api/restaurants/search-for-registration/`

**Benefits**:
- Optimized for registration flow
- Returns only necessary data (name, logo, address)
- Fast response times
- Clear separation of concerns

---

## API Specification

### Endpoint: Search Restaurants for Registration

#### Request
```
GET /api/restaurants/search-for-registration/
```

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search term (minimum 2 characters) |
| `limit` | integer | No | 10 | Maximum number of results (max: 50) |
| `city` | string | No | - | Filter by city name |
| `state` | string | No | - | Filter by state/province |

#### Example Request
```bash
GET /api/restaurants/search-for-registration/?query=pizza&limit=10
GET /api/restaurants/search-for-registration/?query=mario&city=New York&limit=5
```

#### Success Response (200 OK)
```json
{
  "query": "pizza",
  "count": 8,
  "results": [
      {
        "id": 123,
        "name": "Mario's Pizza Palace",
        "image": "https://example.com/media/restaurant_images/marios_pizza.jpg",
        "image_thumbnail": "https://example.com/media/restaurant_images/marios_pizza.jpg",
      "address": {
        "street_address": "123 Main Street",
        "room_number": "Suite 101",
        "city": "New York",
        "state": "NY",
        "postal_code": "10001",
        "country": "United States",
        "full_address": "123 Main Street, Suite 101, New York, NY 10001, United States"
      },
      "coordinates": {
        "latitude": "40.7128",
        "longitude": "-74.0060"
      },
      "phone": "+1-555-123-4567",
      "email": "info@mariospizza.com",
      "is_approved": true
    },
    {
      "id": 456,
      "name": "Artisan Pizza Co",
      "logo": "https://example.com/media/restaurant_logos/artisan_pizza.jpg",
      "logo_thumbnail": "https://example.com/media/restaurant_logos/thumbnails/artisan_pizza.jpg",
      "address": {
        "street_address": "456 Broadway",
        "room_number": null,
        "city": "New York",
        "state": "NY",
        "postal_code": "10013",
        "country": "United States",
        "full_address": "456 Broadway, New York, NY 10013, United States"
      },
      "coordinates": {
        "latitude": "40.7189",
        "longitude": "-74.0010"
      },
      "phone": "+1-555-987-6543",
      "email": "info@artisanpizza.com",
      "is_approved": true
    }
  ]
}
```

#### Short Query Response (< 2 characters)
```json
{
  "query": "p",
  "count": 0,
  "results": []
}
```

#### Error Response (400 Bad Request)
```json
{
  "error": "Query parameter is required and must be at least 2 characters"
}
```

---

## Implementation Details

### Search Logic
- Search by restaurant name (case-insensitive partial match)
- Optionally filter by city and/or state
- Only return approved restaurants (`is_approved=True`)
- Only return original restaurants (`is_original=True`) - exclude duplicates
- Order by restaurant name alphabetically
- Image selection: Returns the first restaurant image from `restaurant.images`, or falls back to logo if no images exist

### Response Fields
- **id**: Restaurant ID (for selection)
- **name**: Restaurant name
- **image**: Full restaurant image URL (first restaurant image, or logo fallback if no images exist)
- **image_thumbnail**: Thumbnail image URL (optional, for faster loading)
- **address**: Structured address object
  - `street_address`
  - `room_number` (nullable)
  - `city`
  - `state`
  - `postal_code`
  - `country`
  - `full_address` (formatted complete address)
- **coordinates**: GPS coordinates (if available)
  - `latitude`
  - `longitude`
- **phone**: Primary phone number
- **email**: Primary email address
- **is_approved**: Approval status

### Performance Considerations
- Use database-level filtering
- Limit results to prevent large responses
- Consider caching for frequently searched terms
- Use `select_related` and `values()` for optimized queries

---

## Alternative Options

### Option 2: Enhance Existing Autocomplete Endpoint
Modify `/api/restaurants/autocomplete/` to include pictures and addresses for restaurants.

**Pros**:
- Reuses existing endpoint
- Single endpoint for all autocomplete needs

**Cons**:
- Mixes different use cases
- May return unnecessary data for general autocomplete
- Could impact performance

### Option 3: Use Existing Restaurant List Endpoint
Use `/api/restaurants/?search=...` with custom serializer.

**Pros**:
- Uses existing infrastructure
- No new endpoint needed

**Cons**:
- Returns too much data
- Includes pagination overhead
- Not optimized for registration flow

---

## Frontend Integration Example

### React/Next.js Example
```typescript
// Search component for owner registration
const RestaurantSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRestaurants = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/restaurants/search-for-registration/?query=${encodeURIComponent(searchQuery)}&limit=10`
        );
        const data = await response.json();
        setResults(data.results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleSelect = (restaurant: Restaurant) => {
    // Handle restaurant selection
    console.log('Selected restaurant:', restaurant.id);
    // Navigate to registration form with restaurant ID
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          searchRestaurants(e.target.value);
        }}
        placeholder="Search for your restaurant..."
      />
      
      {loading && <div>Searching...</div>}
      
      <div className="results">
        {results.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => handleSelect(restaurant)}
            className="restaurant-card"
          >
            {restaurant.image && (
              <img src={restaurant.image_thumbnail || restaurant.image} alt={restaurant.name} />
            )}
            <div>
              <h3>{restaurant.name}</h3>
              <p>{restaurant.address.full_address}</p>
              {restaurant.phone && <p>Phone: {restaurant.phone}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### React Native Example
```typescript
import { useState, useCallback } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { debounce } from 'lodash';

const RestaurantSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRestaurants = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://your-api.com/api/restaurants/search-for-registration/?query=${encodeURIComponent(searchQuery)}&limit=10`
        );
        const data = await response.json();
        setResults(data.results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const renderRestaurant = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => handleSelect(item)}
    >
      {item.image && (
        <Image
          source={{ uri: item.image_thumbnail || item.image }}
          style={styles.logo}
        />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>{item.address.full_address}</Text>
        {item.phone && <Text style={styles.phone}>{item.phone}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          searchRestaurants(text);
        }}
        placeholder="Search for your restaurant..."
      />
      <FlatList
        data={results}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};
```

---

## Registration Flow Integration

### Step 1: User Registration
1. User registers as restaurant owner (`/api/auth/register/` with `user_type: "OWNER"`)
2. User receives authentication token

### Step 2: Restaurant Search
1. User searches for their restaurant using the search endpoint
2. User selects a restaurant from suggestions
3. Restaurant ID is stored in registration form state

### Step 3: Link Restaurant to Owner
1. After registration completion, link restaurant to owner account
2. This could be done via:
   - Updating restaurant owner field: `PATCH /api/restaurants/{id}/` with owner assignment
   - Or creating a new endpoint: `POST /api/restaurants/{id}/claim/` (if restaurant doesn't have owner)

---

## Database Query Optimization

### Recommended Query Structure
```python
from django.db.models import Q, Case, When, Value, CharField
from django.db.models.functions import Concat

restaurants = Restaurant.objects.filter(
    Q(name__icontains=query) &
    Q(is_approved=True) &
    Q(is_original=True)
).annotate(
    full_address=Concat(
        'street_address',
        Value(', '),
        Case(
            When(room_number__isnull=False, then=Concat('room_number', Value(', '))),
            default=Value(''),
            output_field=CharField()
        ),
        'city',
        Value(', '),
        'state',
        Value(' '),
        'postal_code',
        Value(', '),
        'country',
        output_field=CharField()
    )
).values(
    'id',
    'name',
    'logo',
    'street_address',
    'room_number',
    'city',
    'state',
    'postal_code',
    'country',
    'latitude',
    'longitude',
    'phone',
    'email',
    'is_approved',
    'full_address'
).order_by('name')[:limit]
```

---

## Security Considerations

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **Input Validation**: Validate and sanitize query parameters
3. **SQL Injection**: Use Django ORM to prevent SQL injection
4. **Data Privacy**: Only return approved restaurants
5. **Authentication**: Consider if endpoint should require authentication (optional for registration flow)

---

## Testing Recommendations

### Unit Tests
- Test search with various query lengths
- Test filtering by city/state
- Test limit parameter
- Test empty results
- Test invalid parameters

### Integration Tests
- Test full registration flow
- Test restaurant selection and linking
- Test error handling

### Performance Tests
- Test response times with large datasets
- Test concurrent requests
- Test caching effectiveness

---

## Summary

**Recommended Approach**: Create a new dedicated endpoint `/api/restaurants/search-for-registration/` that:
- Returns lightweight restaurant data (id, name, logo, address)
- Optimized for registration flow
- Fast and efficient queries
- Clear separation from general search endpoints

**Next Steps**:
1. Implement the new endpoint in `restaurants/views.py`
2. Add URL route in `restaurants/urls.py`
3. Create serializer for response formatting
4. Add tests
5. Update API documentation
6. Deploy and test with frontend

---

## Related Endpoints

- **User Registration**: `/api/auth/register/`
- **Restaurant Creation**: `/api/restaurants/` (POST)
- **Restaurant Update**: `/api/restaurants/{id}/` (PATCH)
- **General Autocomplete**: `/api/restaurants/autocomplete/`
- **Restaurant List**: `/api/restaurants/` (GET)

---

*Last Updated: January 2025*
*API Version: 1.0*

