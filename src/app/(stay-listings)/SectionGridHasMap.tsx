"use client";

import React, { FC, useEffect, useState } from "react";
import AnyReactComponent from "@/components/AnyReactComponent/AnyReactComponent";
import GoogleMapReact from "google-map-react";
import { DEMO_STAY_LISTINGS } from "@/data/listings";
import ButtonClose from "@/shared/ButtonClose";
import Checkbox from "@/shared/Checkbox";
import Pagination from "@/shared/Pagination";
import TabFilters from "./TabFilters";
import Heading2 from "@/shared/Heading2";
import StayCard2 from "@/components/StayCard2";
import { useSearchParams, useRouter } from "next/navigation";
import { MapPinIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon, HomeIcon, GlobeAsiaAustraliaIcon } from "@heroicons/react/24/outline";

// Global event for dropdown controls without URL params
const triggerDropdownOpen = (type: 'filter' | 'distance' | 'property') => {
  // Create and dispatch a custom event
  const event = new CustomEvent('openSearchDropdown', { detail: { type } });
  window.dispatchEvent(event);
};

const DEMO_STAYS = DEMO_STAY_LISTINGS.filter((_, i) => i < 12);
export interface SectionGridHasMapProps { }

const SectionGridHasMap: FC<SectionGridHasMapProps> = () => {
  const [currentHoverID, setCurrentHoverID] = useState<string | number>(-1);
  const [showFullMapFixed, setShowFullMapFixed] = useState(false);
  const router = useRouter();

  // Get search parameters from URL
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const distance = searchParams.get('distance') || '0-10';
  const category = searchParams.get('category') || '';
  const filters = searchParams.get('filters') || '';

  // Process filters
  const filterItems = filters ? filters.split(',') : [];

  // Handle clicking on filter pills - scroll to top and open dropdown
  const handleFilterPillClick = (type: 'filter' | 'distance' | 'property') => {
    // Find the search form element
    const searchFormElement = document.getElementById('search-form');

    // If element found, scroll to it
    if (searchFormElement) {
      searchFormElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to top of the page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // Wait for scroll to complete before triggering the dropdown
    setTimeout(() => {
      triggerDropdownOpen(type);
    }, 800);
  };

  // Handle removing a filter
  const handleRemoveFilter = (filterToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newParams = new URLSearchParams(searchParams.toString());
    const newFilters = filterItems.filter(item => item !== filterToRemove);
    if (newFilters.length > 0) {
      newParams.set('filters', newFilters.join(','));
    } else {
      newParams.delete('filters');
    }
    const newPath = '/listing-stay-map?' + newParams.toString();
    router.push(newPath as any);
  };

  // Handle removing distance filter
  const handleRemoveDistance = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('distance');
    const newPath = '/listing-stay-map?' + newParams.toString();
    router.push(newPath as any);
  };

  // Format category label
  const getCategoryLabel = () => {
    if (!category) return 'All Categories';

    // Map of special category formats or replacements
    const categoryMap: Record<string, string> = {
      'Fast+Food': 'FAST FOOD TYPES',
      'International+Cuisine': 'INTERNATIONAL CUISINES',
      'Favourite+Foods': 'FAVOURITE FOODS',
      'Child+Friendly': 'CHILD FRIENDLY',
      'Cafés+&+Coffee': 'CAFÉS & COFFEE',
      'Todays+Specials': 'TODAY\'S SPECIALS',
      'Fine+Dining': 'FINE DINING',
      'Casual+Dining': 'CASUAL DINING',
      'Healthy+Foods': 'HEALTHY FOODS'
    };

    // Check if we have a special mapping for this category
    const formattedCategory = categoryMap[category];
    if (formattedCategory) return formattedCategory;

    // Otherwise, transform the category string by replacing '+' with space and capitalizing each word
    return category.split('+')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .toUpperCase();
  };

  // Create subheading content
  const getSearchContent = () => {
    const propertyTypes = searchParams.get('propertyTypes') || '';
    const propertyTypeItems = propertyTypes ? propertyTypes.split(',') : [];

    return (
      <div className="mt-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-end">
          <span className="text-blue-600">
            <button onClick={toggleFilters} className="text-red-900">
              {filtersVisible ? "- Minimise filters" : ""}
            </button>
          </span>
        </div>
        
        {query && (
          <div className="flex items-start mb-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="block text-neutral-600 dark:text-neutral-300 font-medium text-base">
                Search Term:
              </span>
              <span className="block mt-1 text-blue-600">
                "{query}"
              </span>
            </div>
          </div>
        )}

        {filterItems.length > 0 && (
          <div className="flex items-start mb-3">
            <GlobeAsiaAustraliaIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 mb-2 flex items-center justify-between">
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  International Cuisines:
                </span>
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {filterItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleFilterPillClick('filter')}
                  >
                    {item}
                    <button
                      className="ml-1.5 text-blue-500 hover:text-blue-700 focus:outline-none"
                      onClick={(e) => handleRemoveFilter(item, e)}
                      aria-label={`Remove ${item} filter`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {propertyTypeItems.length > 0 && (
          <div className="flex items-start mb-3">
            <HomeIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 mb-2 flex items-center justify-between">
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  Restaurant Type:
                </span>
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {propertyTypeItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-600 border border-green-200 hover:bg-green-50 cursor-pointer"
                    onClick={() => handleFilterPillClick('property')}
                  >
                    {item}
                    <button
                      className="ml-1.5 text-green-500 hover:text-green-700 focus:outline-none"
                      onClick={(e) => handleRemovePropertyType(item, e)}
                      aria-label={`Remove ${item} property type`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start">
          <MapPinIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <span className="block text-neutral-600 dark:text-neutral-300 font-medium text-base">
              Distance Range:
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-50 cursor-pointer"
                onClick={() => handleFilterPillClick('distance')}
              >
                {distance} Kms
                <button
                  className="ml-1.5 text-blue-500 hover:text-blue-700 focus:outline-none"
                  onClick={(e) => handleRemoveDistance(e)}
                  aria-label="Remove distance filter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add handler for removing property types
  const handleRemovePropertyType = (propertyType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentTypes = searchParams.get('propertyTypes')?.split(',') || [];
    const updatedTypes = currentTypes.filter(type => type !== propertyType);
    
    const params = new URLSearchParams(searchParams.toString());
    if (updatedTypes.length > 0) {
      params.set('propertyTypes', updatedTypes.join(','));
    } else {
      params.delete('propertyTypes');
    }
    
    router.push(`/listing-stay-map?${params.toString()}` as any);
  };

  const [filtersVisible, setFiltersVisible] = useState(false);

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  return (
    <div className="SectionGridHasMap" id="restaurant-results">
      <div className="relative flex min-h-screen">
        {/* CARDSSSS */}
        <div className="min-h-screen w-full xl:w-[60%] 2xl:w-[60%] max-w-[1184px] flex-shrink-0 xl:px-8 ">
          <div className="flex justify-between items-center mb-4">
            <Heading2
              heading={
                <span className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                  Restaurants in Australia
                </span>
              }
              subHeading={filtersVisible ? getSearchContent() : null}
              className="!mb-8"
            />
            <button onClick={toggleFilters} className={`ml-4 text-blue-600 `}>
              {filtersVisible ? "" : "+ Show Filters"}
            </button>
          </div>
          {filtersVisible && (
            <div className="mb-8 lg:mb-11">
              <TabFilters page="stay" />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 2xl:gap-x-6 gap-y-8">
            {DEMO_STAYS.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setCurrentHoverID((_) => item.id)}
                onMouseLeave={() => setCurrentHoverID((_) => -1)}
              >
                <StayCard2 data={item} />
              </div>
            ))}
          </div>
          <div className="flex mt-16 justify-center items-center">
            <Pagination />
          </div>
        </div>

        {!showFullMapFixed && (
          <div
            className={`flex xl:hidden items-center justify-center fixed bottom-16 md:bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-neutral-900 text-white shadow-2xl rounded-full z-30  space-x-3 text-sm cursor-pointer`}
            onClick={() => setShowFullMapFixed(true)}
          >
            <i className="text-lg las la-map"></i>
            <span>Show map</span>
          </div>
        )}

        {/* MAPPPPP */}
        <div
          className={`xl:flex-1 xl:static xl:block ${showFullMapFixed ? "fixed inset-0 z-50" : "hidden"
            }`}
        >
          {showFullMapFixed && (
            <ButtonClose
              onClick={() => setShowFullMapFixed(false)}
              className="bg-white absolute z-50 left-3 top-3 shadow-lg rounded-xl w-10 h-10"
            />
          )}

          <div className="fixed xl:sticky top-0 xl:top-[88px] left-0 w-full h-full xl:h-[calc(100vh-88px)] rounded-md overflow-hidden">
            <div className="absolute bottom-5 left-3 lg:bottom-auto lg:top-2.5 lg:left-1/2 transform lg:-translate-x-1/2 py-2 px-4 bg-white dark:bg-neutral-800 shadow-xl z-10 rounded-2xl min-w-max">
              <Checkbox
                className="text-xs xl:text-sm"
                name="xx"
                label="Search as I move the map"
              />
            </div>
            <GoogleMapReact
              defaultZoom={12}
              defaultCenter={DEMO_STAYS[0].map}
              bootstrapURLKeys={{
                key: "AIzaSyAGVJfZMAKYfZ71nzL_v5i3LjTTWnCYwTY",
                version: "weekly",
                libraries: ["places"]
              }}
              yesIWantToUseGoogleMapApiInternals
            >
              {DEMO_STAYS.map((item) => (
                <AnyReactComponent
                  isSelected={currentHoverID === item.id}
                  key={item.id}
                  lat={item.map.lat}
                  lng={item.map.lng}
                  listing={item}
                />
              ))}
            </GoogleMapReact>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionGridHasMap;
