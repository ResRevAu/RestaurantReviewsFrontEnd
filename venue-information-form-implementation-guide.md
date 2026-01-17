# Venue Information Form Implementation Guide

## Overview

This document provides a comprehensive guide for implementing a multi-step venue information form with two main sections:
1. **Venue Name** (Required)
2. **Venue Address** (Required)

The form includes advanced features such as phone number validation, Google Maps integration, address autocomplete, and real-time validation feedback.

---

## Table of Contents

1. [Form Structure](#form-structure)
2. [Venue Name Form](#venue-name-form)
3. [Venue Address Form](#venue-address-form)
4. [UI Components](#ui-components)
5. [Validation Rules](#validation-rules)
6. [State Management](#state-management)
7. [Dependencies](#dependencies)
8. [Implementation Steps](#implementation-steps)

---

## Form Structure

### Layout Overview

The form uses a multi-step wizard pattern with:
- **Progress Bar**: Shows current step and allows navigation between steps
- **Form Card**: Contains the form fields
- **Navigation Buttons**: Previous, Watch Tutorial, More Information, and Save & Continue

### Progress Bar

The progress bar displays three steps:
1. Venue Name
2. Venue Address
3. Select Map Icon (optional - not required)

**Visual Design:**
- Horizontal progress bar with step labels above
- Current step highlighted in bold
- Completed steps show green checkmark icon
- Progress fill bar shows completion percentage
- Steps are clickable for navigation (if enabled)

**Implementation:**
```typescript
<CustomProgressBar
  steps={["Venue Name", "Venue Address", "Select Map Icon"]}
  currentStepIndex={0} // or 1 for address step
  stepUrls={[
    "/venue-information/venue-name",
    "/venue-information/venue-address",
    "/venue-information/select-map-icon"
  ]}
  enableNavigation={true}
/>
```

---

## Venue Name Form

### Form Fields

#### 1. Venue Name (Required)
- **Type**: Text input
- **Icon**: Restaurant icon (left side)
- **Placeholder**: "Moo Moo Restaurant"
- **Validation**: 
  - Required field
  - Cannot be empty or whitespace only
  - Real-time validation feedback (green border when valid, red when invalid)
- **Visual Feedback**:
  - Red border + error message when invalid
  - Green border when valid
  - Gray border when empty/neutral

#### 2. Venue Phone (Required)
- **Type**: Phone input with country code selector
- **Icon**: Phone icon (left side)
- **Placeholder**: "411 222 333 or 7 1234 5678"
- **Features**:
  - Country code dropdown with flag icons
  - Real-time phone number formatting
  - Automatic detection of mobile vs landline
  - Supports leading zero (automatically removed for AU/NZ)
- **Country Selector**:
  - Searchable dropdown
  - Shows country flag + country code (e.g., "+61")
  - Default: Australia (+61)
  - Uses `react-select` with custom styling
- **Validation**:
  - Required field
  - Uses `libphonenumber-js` for international validation
  - Validates against selected country code
  - Shows error message if invalid
  - Shows phone type indicator when valid (Mobile/Landline)
- **Visual Feedback**:
  - Red border + error message when invalid
  - Green border + type indicator when valid
  - Helper text: "Mobile or landline accepted (leading 0 is optional)"

#### 3. Venue Website (Optional)
- **Type**: Text input
- **Icon**: Globe icon (left side)
- **Placeholder**: "https://www.moomoo.com.au"
- **Validation**:
  - Optional field
  - Must be valid URL format if provided
  - Regex: `/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/`
  - Must contain at least one dot
  - Cannot be just "www." or empty protocol
- **Visual Feedback**:
  - Red border + error message when invalid
  - Green border when valid
  - Gray border when empty

#### 4. Venue Email (Optional)
- **Type**: Email input
- **Icon**: Envelope icon (left side)
- **Placeholder**: "restaurant@example.com"
- **Features**:
  - Auto-prefilled with user's account email (if available)
  - Shows helper text when using account email
  - Shows confirmation message when using different email
- **Validation**:
  - Optional field
  - Must be valid email format if provided
  - Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Visual Feedback**:
  - Red border + error message when invalid
  - Green border when valid
  - Blue helper text when using different email

### Form Layout

```
┌─────────────────────────────────────────┐
│  Progress Bar: [Venue Name] [Address]  │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │  Venue Name                       │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ 🍴 Venue Name:              │  │  │
│  │  │    [Moo Moo Restaurant]     │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ 📞 Phone: [+61 ▼] [411...] │  │  │
│  │  │    📱 Mobile number detected│  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ 🌐 Website: [https://...]   │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │ ✉️ Email: [restaurant@...]  │  │  │
│  │  └─────────────────────────────┘  │  │
│  │                                   │  │
│  │  [Watch Tutorial] [More Info]    │  │
│  │                        [Save & →] │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Navigation Buttons

- **Watch Tutorial**: Opens modal with YouTube video tutorial
- **More Information**: Opens modal with detailed help sections
- **Save & Continue**: Validates form and navigates to next step

---

## Venue Address Form

### Form Fields

#### 1. Address Search (Primary Input)
- **Type**: Google Places Autocomplete input
- **Icon**: Location pin icon (left side)
- **Placeholder**: "Search address or enter manually"
- **Features**:
  - Google Places Autocomplete integration
  - Real-time address suggestions dropdown
  - Auto-fills manual fields when address selected
  - Clear button (X icon) to reset form
  - Restricted to Australia by default (`componentRestrictions: { country: "au" }`)
- **Behavior**:
  - When user selects an address from autocomplete:
    1. Fills the search input with full address
    2. Calls Google Geocoding API to parse address components
    3. Auto-populates all manual fields:
       - Unit Number (if available)
       - Street Number
       - Street Name
       - Suburb
       - State
       - Postcode
       - Country

#### 2. Use Current Location (Radio Button)
- **Type**: Radio button with loading state
- **Label**: "Use Current Location"
- **Features**:
  - Uses browser Geolocation API
  - Shows spinner while loading
  - Reverse geocodes coordinates to address
  - Auto-fills all form fields
  - Can be toggled off to clear fields
- **Behavior**:
  - On click: Requests user location permission
  - Gets coordinates via `navigator.geolocation.getCurrentPosition`
  - Calls Google Geocoding API with lat/lng
  - Parses and fills all address fields

#### 3. Manual Address Fields

**Unit Number** (Optional)
- **Type**: Text input
- **Placeholder**: "Unit 1"
- **Validation**: Optional, no validation required
- **Auto-capitalization**: First letter of each word capitalized

**Street Number** (Required)
- **Type**: Text input
- **Placeholder**: "123"
- **Validation**: Required, cannot be empty
- **Error Message**: "Street number is required"

**Street Name** (Required)
- **Type**: Text input
- **Placeholder**: "Main St"
- **Validation**: Required, cannot be empty
- **Error Message**: "Street name is required"
- **Auto-capitalization**: First letter of each word capitalized

**Suburb** (Required)
- **Type**: Text input
- **Placeholder**: "Robina"
- **Validation**: Required, cannot be empty
- **Error Message**: "Suburb is required"
- **Auto-capitalization**: First letter of each word capitalized

**State** (Required)
- **Type**: Text input
- **Placeholder**: "QLD"
- **Validation**: Required, cannot be empty
- **Error Message**: "State is required"
- **Auto-capitalization**: First letter of each word capitalized

**Postcode** (Required)
- **Type**: Text input (numbers only)
- **Placeholder**: "4227"
- **Validation**: Required, must be exactly 4 digits
- **Regex**: `/^\d{4}$/`
- **Error Message**: "Please enter a valid 4-digit postcode"

**Country** (Optional)
- **Type**: Text input
- **Placeholder**: "Australia"
- **Default Value**: "Australia"
- **Validation**: Optional
- **Auto-capitalization**: First letter of each word capitalized

### Map Display

- **Type**: Google Maps iframe embed
- **Position**: Right side of form (50% width on desktop)
- **Features**:
  - Shows address location on map
  - Updates dynamically when address changes
  - Embedded map with search query
  - Minimum height: 420px
- **Implementation**:
```html
<iframe
  width="100%"
  height="97%"
  style={{ minHeight: '420px', border: 0 }}
  loading="lazy"
  allowFullScreen
  referrerPolicy="no-referrer-when-downgrade"
  src={`https://www.google.com/maps?q=${encodeURIComponent(address || 'Queensland, Australia')}&output=embed`}
/>
```

### Form Layout

```
┌─────────────────────────────────────────────────────────┐
│  Progress Bar: [Venue Name] [Venue Address] [Map Icon]  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┬─────────────────────────┐  │
│  │  Form Fields (50%)       │  Map Display (50%)      │  │
│  │  ┌────────────────────┐  │  ┌───────────────────┐  │  │
│  │  │ 📍 Address Search │  │  │                   │  │  │
│  │  │ [Search address..]│  │  │   Google Map      │  │  │
│  │  └────────────────────┘  │  │   (iframe)        │  │  │
│  │  ⚪ Use Current Location │  │                   │  │  │
│  │  ┌────────────────────┐  │  │                   │  │  │
│  │  │ Unit: [Unit 1]     │  │  │                   │  │  │
│  │  │ Street #: [123]    │  │  │                   │  │  │
│  │  └────────────────────┘  │  └───────────────────┘  │  │
│  │  ┌────────────────────┐  │                        │  │
│  │  │ Street: [Main St]  │  │                        │  │
│  │  │ Suburb: [Robina]   │  │                        │  │
│  │  └────────────────────┘  │                        │  │
│  │  ┌────────────────────┐  │                        │  │
│  │  │ State: [QLD]       │  │                        │  │
│  │  │ Postcode: [4227]   │  │                        │  │
│  │  └────────────────────┘  │                        │  │
│  │  Country: [Australia]     │                        │  │
│  │                           │                        │  │
│  │  [← Previous] [Tutorial]   │                        │  │
│  │              [Save & →]   │                        │  │
│  └──────────────────────────┴─────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## UI Components

### Input Field Styling

All input fields follow this pattern:
- **Base Style**: Rounded border, padding, focus ring
- **Icon Position**: Absolute left positioning (padding-left: 44px or 140px for phone)
- **Validation States**:
  - **Default**: `border-gray-300`
  - **Valid**: `border-green-500`
  - **Invalid**: `border-red-500`
  - **Focus**: `focus:border-brand-300 ring-brand-500/20`

### Error Messages

- **Position**: Below input field
- **Style**: `text-red-500 text-xs mt-1`
- **Display**: Only shown when field has error

### Success Indicators

- **Phone Type**: Shows below phone input when valid
  - Mobile: "📱 Mobile number detected" (blue)
  - Landline: "📞 Landline number detected" (green)
- **Email Confirmation**: Shows when using different email than account
  - "✓ Using a different email for restaurant communications" (blue)

---

## Validation Rules

### Venue Name Form

| Field | Required | Validation Rules | Error Messages |
|-------|----------|------------------|----------------|
| Venue Name | ✅ Yes | Non-empty string after trim | "Venue name is required" |
| Phone | ✅ Yes | Valid phone number for selected country (libphonenumber-js) | "Please enter a valid phone number" or specific error from validator |
| Website | ❌ No | Valid URL format if provided | "Please enter a valid website URL" |
| Email | ❌ No | Valid email format if provided | "Please enter a valid email address" |

### Venue Address Form

| Field | Required | Validation Rules | Error Messages |
|-------|----------|------------------|----------------|
| Street Number | ✅ Yes | Non-empty string | "Street number is required" |
| Street Name | ✅ Yes | Non-empty string | "Street name is required" |
| Suburb | ✅ Yes | Non-empty string | "Suburb is required" |
| State | ✅ Yes | Non-empty string | "State is required" |
| Postcode | ✅ Yes | Exactly 4 digits (`/^\d{4}$/`) | "Please enter a valid 4-digit postcode" |
| Unit Number | ❌ No | No validation | - |
| Country | ❌ No | No validation | - |

### Validation Flow

1. **Real-time Validation**: Fields validate on change/blur
2. **Form Submission**: All required fields validated on submit
3. **Error Display**: Errors shown below each field
4. **Prevent Navigation**: Form cannot proceed if validation fails

---

## State Management

### Data Structure

```typescript
interface VenueInformation {
  name: string;
  phone: string; // International format: "+61 411 222 333"
  website: string;
  email: string;
  address: {
    unitNumber: string;
    streetNumber: string;
    streetName: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
    fullAddress: string; // Full formatted address from Google Places
  };
}
```

### Store Methods

- `store.venueInformation`: Get current venue information
- `store.updateVenueInformation({ ... })`: Update venue information (partial update supported)

### Local State

**Venue Name Form:**
- `venueName`: Current venue name value
- `phone`: Current phone value
- `website`: Current website value
- `email`: Current email value
- `selectedCountry`: Selected country code object
- `customPhone`: Local phone number (without country code)
- `phoneType`: Detected phone type ('MOBILE', 'FIXED_LINE', etc.)
- Error states for each field

**Venue Address Form:**
- `address`: Full address string (from autocomplete)
- `useCurrent`: Boolean for "Use Current Location" toggle
- `isLoadingLocation`: Loading state for geolocation
- `mapsLoaded`: Boolean for Google Maps script loading
- `fields`: Object containing all manual address fields
- `errors`: Object containing error messages for each field

---

## Dependencies

### Required Packages

```json
{
  "react": "^19.2.1",
  "react-dom": "^19.2.1",
  "next": "^15.5.7",
  "react-select": "^5.10.1",
  "react-country-flag": "^3.1.0",
  "react-places-autocomplete": "^7.3.0",
  "libphonenumber-js": "^0.x.x",
  "react-phone-number-input": "^3.4.12",
  "countries-list": "^3.1.1",
  "zustand": "^5.0.5"
}
```

### Google Maps API

**Required APIs:**
- Maps JavaScript API
- Geocoding API
- Places API

**Environment Variable:**
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Script Loading:**
```typescript
useEffect(() => {
  if (typeof window !== "undefined") {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setMapsLoaded(true);
    document.body.appendChild(script);
  }
}, []);
```

---

## Implementation Steps

### Step 1: Setup Dependencies

```bash
npm install react-select react-country-flag react-places-autocomplete \
  libphonenumber-js react-phone-number-input countries-list zustand
```

### Step 2: Create State Store

Create a Zustand store for venue information:

```typescript
import { create } from 'zustand';

interface VenueInformation {
  name: string;
  phone: string;
  website: string;
  email: string;
  address?: {
    unitNumber: string;
    streetNumber: string;
    streetName: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
    fullAddress: string;
  };
}

interface WizardStore {
  venueInformation: VenueInformation;
  updateVenueInformation: (data: Partial<VenueInformation>) => void;
}

export const useWizardStore = create<WizardStore>((set) => ({
  venueInformation: {
    name: '',
    phone: '',
    website: '',
    email: '',
  },
  updateVenueInformation: (data) =>
    set((state) => ({
      venueInformation: { ...state.venueInformation, ...data },
    })),
}));
```

### Step 3: Create Phone Validation Utility

```typescript
import { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';
import { AsYouType } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

export function validatePhone(
  phoneNumber: string,
  defaultCountry?: CountryCode
): { isValid: boolean; error?: string; formatted?: string; type?: string } {
  const cleaned = phoneNumber.trim();
  if (!cleaned) {
    return { isValid: false, error: 'Phone number is required' };
  }

  try {
    const isValid = isValidPhoneNumber(cleaned, defaultCountry);
    if (!isValid) {
      return { isValid: false, error: 'Please enter a valid phone number' };
    }

    const phoneNumberObj = parsePhoneNumber(cleaned, defaultCountry);
    return {
      isValid: true,
      formatted: phoneNumberObj?.formatInternational(),
      type: phoneNumberObj?.getType() || 'UNKNOWN',
    };
  } catch {
    return { isValid: false, error: 'Invalid phone number format' };
  }
}

export function formatPhoneInput(
  phoneNumber: string,
  defaultCountry?: CountryCode
): string {
  if (!phoneNumber) return '';
  try {
    const formatter = new AsYouType(defaultCountry);
    return formatter.input(phoneNumber);
  } catch {
    return phoneNumber.replace(/[^\d\s+]/g, '');
  }
}
```

### Step 4: Create Progress Bar Component

See `CustomProgressBar.tsx` implementation above.

### Step 5: Create Form Navigation Buttons Component

See `FormNavigationButtons.tsx` implementation above.

### Step 6: Implement Venue Name Form

Key implementation points:
1. Country selector using `react-select` with custom styling
2. Phone input with real-time formatting
3. Real-time validation with visual feedback
4. Store integration for data persistence

### Step 7: Implement Venue Address Form

Key implementation points:
1. Google Places Autocomplete integration
2. Dynamic Google Maps script loading
3. Geolocation API integration
4. Google Geocoding API for address parsing
5. Manual field auto-capitalization
6. Map iframe embed

### Step 8: Add Validation

- Implement validation functions for each field
- Add error state management
- Display error messages below fields
- Prevent form submission on validation errors

### Step 9: Add Helper Features

- Tutorial modal (YouTube embed)
- More Information modal
- Return to Preview functionality (if coming from preview)

---

## Key Features Summary

### Venue Name Form
✅ Required fields: Name, Phone  
✅ Optional fields: Website, Email  
✅ Phone number validation with country code selector  
✅ Real-time validation feedback  
✅ Auto-prefill email from user account  
✅ Phone type detection (Mobile/Landline)  
✅ International phone number support  

### Venue Address Form
✅ Required fields: Street Number, Street Name, Suburb, State, Postcode  
✅ Optional fields: Unit Number, Country  
✅ Google Places Autocomplete  
✅ "Use Current Location" feature  
✅ Auto-fill manual fields from autocomplete  
✅ Google Maps display  
✅ Real-time validation feedback  
✅ Auto-capitalization of text fields  

### Shared Features
✅ Progress bar with step navigation  
✅ Form persistence (Zustand store)  
✅ Tutorial videos  
✅ Help documentation  
✅ Responsive design (mobile/desktop)  
✅ Accessibility considerations  

---

## Testing Checklist

- [ ] Venue name validation (required, empty, whitespace)
- [ ] Phone validation (valid/invalid numbers, different countries)
- [ ] Website validation (valid/invalid URLs, optional)
- [ ] Email validation (valid/invalid emails, optional)
- [ ] Address autocomplete (search, select, auto-fill)
- [ ] Current location (permission, geolocation, reverse geocoding)
- [ ] Manual address fields (validation, auto-capitalization)
- [ ] Form submission (validation errors prevent navigation)
- [ ] Data persistence (store updates, navigation preserves data)
- [ ] Progress bar navigation (click to navigate between steps)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Error messages display correctly
- [ ] Success indicators show appropriately

---

## Notes

1. **Phone Number Handling**: The form automatically removes leading zeros for countries like Australia and New Zealand. Users can input "0411 222 333" and it will be converted to "411 222 333" internally.

2. **Address Parsing**: When an address is selected from autocomplete, the Google Geocoding API is called to parse the address into components. This ensures accurate field population.

3. **State Management**: The form uses Zustand for state management, allowing data to persist across navigation and page refreshes.

4. **Google Maps API**: The Maps API script is loaded dynamically to avoid blocking page load. The form waits for the script to load before enabling autocomplete.

5. **Accessibility**: All form fields have proper labels, error messages are associated with inputs, and keyboard navigation is supported.

6. **Browser Compatibility**: Geolocation API requires HTTPS in production. Ensure your deployment uses HTTPS for the "Use Current Location" feature to work.

---

## Support

For questions or clarifications, refer to:
- Phone validation: `src/utils/phoneValidation.ts`
- Venue Name form: `src/app/venue-information/venue-name/page.tsx`
- Venue Address form: `src/app/venue-information/venue-address/page.tsx`
- Store implementation: `src/store/wizardStore.ts`
