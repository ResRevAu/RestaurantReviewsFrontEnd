"use client";

import React, { useState, Fragment, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  PlusIcon,
  GlobeAltIcon,
  MicrophoneIcon,
  MapPinIcon,
  HeartIcon,
  FireIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import LocationSelector from "@/components/LocationSelector";
import SimpleLocationDisplay from "@/components/SimpleLocationDisplay";
import DistanceSelector from "@/components/DistanceSelector";
import Checkbox from "@/shared/Checkbox";
import InternationalCuisinesDropdown from "@/components/InternationalCuisinesDropdown";
import FavouriteDishDropdown from "@/components/FavouriteDishDropdown";
import PopularFoodsDropdown from "@/components/PopularFoodsDropdown";
import TodaysSpecialsDropdown from "@/components/TodaysSpecialsDropdown";
import RestaurantTypeDropdown from '@/components/RestaurantTypeDropdown';
import RestaurantNameDropdown from '@/components/RestaurantNameDropdown';
import PredictiveSearchDropdown, { Suggestion } from '@/components/PredictiveSearchDropdown';

export interface SectionHeroProps {
  className?: string;
}

// Filter data
const filterTags = [
  { name: 'International Cuisines', icon: GlobeAltIcon, defaultChecked: true },
  { name: 'Favourite Dish', icon: HeartIcon, defaultChecked: true },
  { name: 'Popular Foods', icon: FireIcon },
  { name: 'Restaurant name', icon: MagnifyingGlassIcon },
  { name: 'Restaurant Types', icon: BuildingStorefrontIcon },
  { name: 'Todays, Specials', icon: CurrencyDollarIcon },
];

const moreFilter1 = [
  { name: "Italian", defaultChecked: true },
  { name: "Chinese", defaultChecked: true },
  { name: "Indian" },
  { name: "Japanese" },
  { name: "Mexican" },
  { name: "Thai" },
  { name: "Mediterranean" },
  { name: "American" },
  { name: "French" },
  { name: "Korean" },
];

const moreFilter2 = [
  { name: "Vegetarian" },
  { name: "Vegan" },
  { name: "Gluten-Free" },
  { name: "Halal" },
  { name: "Kosher" },
];

const moreFilter3 = [
  { name: "Fine Dining" },
  { name: "Casual Dining" },
  { name: "Fast Food" },
  { name: "Cafe" },
  { name: "Bistro" },
  { name: "Buffet" },
  { name: "Food Truck" },
  { name: "Pub" },
  { name: "Bar" },
  { name: "Diner" },
];

const SectionHero: React.FC<SectionHeroProps> = ({ className = "" }) => {
  const [isOpenMoreFilter, setIsOpenMoreFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Check if we're on the listing-stay-map page
  const isListingPage = pathname === "/listing-stay-map";

  // Initialize search query from URL params on listing page (only once)
  useEffect(() => {
    if (isListingPage) {
      const urlQuery = searchParams.get('query') || '';
      // Only set if search query is empty (initial load)
      if (urlQuery && !searchQuery) {
        setSearchQuery(urlQuery);
        console.log('🔄 Initialized search query from URL:', urlQuery);
      }
    }
  }, [isListingPage]); // Remove searchQuery from dependencies to prevent overriding user input

  const closeModalMoreFilter = () => setIsOpenMoreFilter(false);
  const openModalMoreFilter = () => setIsOpenMoreFilter(true);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen, searchQuery]);

  const renderMoreFilterItem = (
    data: {
      name: string;
      defaultChecked?: boolean;
    }[]
  ) => {
    const list1 = data.filter((_, i) => i < data.length / 2);
    const list2 = data.filter((_, i) => i >= data.length / 2);
    return (
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col space-y-5">
          {list1.map((item) => (
            <Checkbox
              key={item.name}
              name={item.name}
              label={item.name}
              className="bg-neutral-50 dark:bg-neutral-800"
              checked={!!item.defaultChecked}
            />
          ))}
        </div>
        <div className="flex flex-col space-y-5">
          {list2.map((item) => (
            <Checkbox
              key={item.name}
              name={item.name}
              label={item.name}
              className="bg-neutral-50 dark:bg-neutral-800"
              checked={!!item.defaultChecked}
            />
          ))}
        </div>
      </div>
    );
  };

  const handleLocationSelect = (location: any) => {
    console.log('Selected location:', location);
    // Handle the selected location
  };

  const handleDistanceChange = (distanceRange: string) => {
    console.log('Selected distance range:', distanceRange);
    // Handle the distance range change
  };

  const handleCuisineChange = (selectedCuisines: string[]) => {
    console.log('Selected cuisines:', selectedCuisines);
    // Handle the selected cuisines
  };

  const handleFavouriteDishChange = (selectedDishes: string[]) => {
    console.log('Selected dishes:', selectedDishes);
    // Handle the selected dishes
  };

  const handlePopularFoodsChange = (selectedFoods: string[]) => {
    console.log('Selected foods:', selectedFoods);
    // Handle the selected foods
  };

  const handleTodaysSpecialsChange = (selectedSpecials: string[]) => {
    console.log('Selected specials:', selectedSpecials);
    // Handle the selected specials
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    console.log("Selected Suggestion:", suggestion);
    let newQuery = "";
    
    switch (suggestion.type) {
      case 'restaurant':
        newQuery = suggestion.name;
        break;
      case 'menu_item':
        newQuery = suggestion.name;
        break;
      case 'venue_type':
        newQuery = suggestion.name;
        break;
      case 'cuisine_type':
        newQuery = suggestion.name;
        break;
      case 'amenity':
        newQuery = suggestion.name;
        break;
      case 'recent':
        newQuery = suggestion.text;
        break;
      case 'near_me':
        newQuery = suggestion.text;
        break;
      default:
        newQuery = searchQuery;
    }
    
    setSearchQuery(newQuery);
    setIsSearchOpen(false);
  };

  return (
    <div className={`nc-SectionHero relative ${isListingPage ? 'pt-5 pb-5' : 'pt-6 lg:pt-8 mb-[100px] mt-[50px]'} ${className}`}>
      {/* Background Image */}
     

      {/* Content */}
      <div className="relative z-10 container mx-auto">
        <div className="flex flex-col items-center justify-center">
          {!isListingPage && (
            <h1 className="text-4xl mt-20 text-gray-600 font-semibold">What can I help with?</h1>
          )}
          
          {/* ChatGPT-style Search Bar */}
          <div className="w-full max-w-5xl  mx-auto">
            {/* Current Location Display - Hidden on listing page */}
            {!isListingPage && (
              <div className="mb-1 flex justify-center">
                <SimpleLocationDisplay 
                  className="px-4 py-2 rounded-lg text-black" 
                  onLocationChange={(location) => {
                    console.log('🏠 Location updated in hero section:', location);
                  }}
                />
              </div>
            )}

            <div className="relative flex flex-col bg-white rounded-2xl shadow-lg">
              {/* Input and Icons Row */}
              <div className="flex items-center h-[100px]">
                <div className="flex items-center gap-3 pl-4">
                  <button 
                    onClick={openModalMoreFilter}
                    className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-6 h-6 text-indigo-600 stroke-2" />
                  </button>
                </div>
                
                <div className="flex-1 relative" ref={searchContainerRef}>
                  <input
                    type="text"
                    placeholder="Search restaurants by name, cuisines, types, etc."
                    className="w-full px-4 py-4 pr-10 text-lg border-none focus:ring-0 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => {      
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true); // Always open when typing
                      console.log('✏️ User edited search query:', e.target.value);
                    }}
                    onFocus={() => {
                      setIsSearchOpen(true); // Always open on focus to show recent searches
                    }}
                    onKeyDown={(e) => {
                      // Handle Enter key for search
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const params = new URLSearchParams();
                        if (searchQuery.trim()) {
                          params.set('query', searchQuery.trim());
                        }
                        const url = `/listing-stay-map${params.toString() ? '?' + params.toString() : ''}`;
                        console.log('⌨️ Enter pressed, searching:', searchQuery.trim());
                        window.location.href = url;
                      }
                      // Handle Escape key to close dropdown
                      if (e.key === 'Escape') {
                        setIsSearchOpen(false);
                      }
                    }}
                  />
                  
                  {/* Clear button */}
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchOpen(false);
                        console.log('🗑️ Search query cleared');
                        // If on listing page, redirect to clear results
                        if (isListingPage) {
                          window.location.href = '/listing-stay-map';
                        }
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                      title="Clear search"
                    >
                      <XMarkIcon className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
                    </button>
                  )}
                  
                  {isSearchOpen && (
                    <PredictiveSearchDropdown 
                      query={searchQuery}
                      isOpen={isSearchOpen}
                      onClose={() => setIsSearchOpen(false)}
                      onSelectSuggestion={handleSuggestionSelect}
                      showRecentSearches={true}
                    />
                  )}
                </div>

                <div className="flex items-center gap-1 pr-4">
                  <LocationSelector onSelect={handleLocationSelect} />
                  <DistanceSelector 
                    onChange={handleDistanceChange}
                    defaultDistance="1-10"
                  />
                  <button className="p-1 hover:bg-indigo-50 rounded-lg transition-colors">
                    <MicrophoneIcon className="w-6 h-6 text-indigo-600 stroke-2" />
                  </button>
                  
                </div>
                <div className="flex items-center gap-3 pr-4">
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (searchQuery.trim()) {
                        params.set('query', searchQuery.trim());
                      }
                      // Add other filters here if needed
                      const url = `/listing-stay-map${params.toString() ? '?' + params.toString() : ''}`;
                      
                      // Log search action
                      console.log('🔍 SEARCH BUTTON CLICKED:');
                      console.log('- Search Query:', searchQuery.trim());
                      console.log('- URL Parameters:', params.toString());
                      console.log('- Final URL:', url);
                      
                      window.location.href = url;
                    }}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors"
                  >
                    <MagnifyingGlassIcon className="w-6 h-6 text-white stroke-2" />
                  </button>
                </div>
              </div>

             
            </div>
          </div>
           {/* Filter Tags Row */}
           <div className="flex  items-center justify-between mt-4 gap-4">
            <div className = " group relative">
              <div className="">
                <InternationalCuisinesDropdown 
                  onChange={handleCuisineChange} 
                />
              </div>
              <div className="absolute z-10 hidden group-hover:block w-64 bg-white dark:bg-neutral-800 mt-2 rounded-xl shadow-xl border dark:border-neutral-700">
                <div className="px-3 pt-2 pb-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Filter by Cuisine</div>
                <div className="px-3 pb-2 text-sm text-neutral-600 dark:text-neutral-300">
                  Discover restaurants by their cuisine type. Select from Italian, Chinese, Indian, and more to find your perfect dining experience.
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="">
                <FavouriteDishDropdown 
                  onChange={handleFavouriteDishChange} 
                />
              </div>
              <div className="absolute z-10 hidden group-hover:block w-64 bg-white dark:bg-neutral-800 mt-2 rounded-xl shadow-xl border dark:border-neutral-700">
                <div className="px-3 pt-2 pb-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Find Your Favorites</div>
                <div className="px-3 pb-2 text-sm text-neutral-600 dark:text-neutral-300">
                  Search for specific dishes you love. Whether it's pizza, sushi, or curry, find restaurants that serve your favorite meals.
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="">
                <PopularFoodsDropdown 
                  onChange={handlePopularFoodsChange} 
                />
              </div>
              <div className="absolute z-10 hidden group-hover:block w-64 bg-white dark:bg-neutral-800 mt-2 rounded-xl shadow-xl border dark:border-neutral-700">
                <div className="px-3 pt-2 pb-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Trending Dishes</div>
                <div className="px-3 pb-2 text-sm text-neutral-600 dark:text-neutral-300">
                  Explore what's popular right now. Find restaurants serving trending dishes and discover new favorites.
                </div>
              </div>
            </div>

            <div className="group relative">
                <div className="">
                <RestaurantNameDropdown 
                  onChange={(restaurants) => {
                    console.log('Selected restaurants:', restaurants);
                  }}
                />
              </div>
              <div className="absolute z-10 hidden group-hover:block w-64 bg-white dark:bg-neutral-800 mt-2 rounded-xl shadow-xl border dark:border-neutral-700">
                <div className="px-3 pt-2 pb-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Search by Name</div>
                <div className="px-3 pb-2 text-sm text-neutral-600 dark:text-neutral-300">
                  Looking for a specific restaurant? Search by name to find your favorite dining spots quickly.
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="">
                <TodaysSpecialsDropdown 
                  onChange={handleTodaysSpecialsChange} 
                />
              </div>
              <div className="absolute z-10 hidden group-hover:block w-64 bg-white dark:bg-neutral-800 mt-2 rounded-xl shadow-xl border dark:border-neutral-700">
                <div className="px-3 pt-2 pb-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Today's Specials</div>
                <div className="px-3 pb-2 text-sm text-neutral-600 dark:text-neutral-300">
                  Find restaurants offering special deals and promotions today. Save money while enjoying great food!
                </div>
            </div>
          </div>

            <div className="group relative">
              <div className="">
                <RestaurantTypeDropdown 
                  onChange={(selectedTypes) => {
                    console.log('Selected types:', selectedTypes);
                  }}
                />
              </div>
              <div className="absolute z-10 hidden group-hover:block w-64 bg-white dark:bg-neutral-800 mt-2 rounded-xl shadow-xl border dark:border-neutral-700">
                <div className="px-3 pt-2 pb-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Restaurant Types</div>
                <div className="px-3 pb-2 text-sm text-neutral-600 dark:text-neutral-300">
                  Filter by restaurant style - from fine dining to casual eateries, find the perfect atmosphere for your meal.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <Transition appear show={isOpenMoreFilter} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeModalMoreFilter}
        >
          <div className="min-h-screen text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              className="inline-block py-8 px-2 h-screen w-full max-w-4xl"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-flex flex-col w-full max-w-4xl text-left align-middle transition-all transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 dark:border dark:border-neutral-700 dark:text-neutral-100 shadow-xl h-full">
                <div className="relative flex-shrink-0 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 text-center">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    More filters
                  </Dialog.Title>
                  <button
                    onClick={closeModalMoreFilter}
                    className="absolute left-3 top-3 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto">
                  <div className="px-10 divide-y divide-neutral-200 dark:divide-neutral-800">
                    <div className="py-7">
                      <h3 className="text-xl font-medium">Cuisines</h3>
                      <div className="mt-6 relative text-primary-500">
                        {renderMoreFilterItem(moreFilter1)}
                      </div>
                    </div>
                    <div className="py-7">
                      <h3 className="text-xl font-medium">Dietary Preferences</h3>
                      <div className="mt-6 relative">
                        {renderMoreFilterItem(moreFilter2)}
                      </div>
                    </div>
                    <div className="py-7">
                      <h3 className="text-xl font-medium">Restaurant Types</h3>
                      <div className="mt-6 relative">
                        {renderMoreFilterItem(moreFilter3)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-shrink-0 bg-neutral-50 dark:bg-neutral-900 dark:border-t dark:border-neutral-800 flex items-center justify-between">
                  <button
                    onClick={closeModalMoreFilter}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    Clear
                  </button>
                  <button
                    onClick={closeModalMoreFilter}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default SectionHero;
