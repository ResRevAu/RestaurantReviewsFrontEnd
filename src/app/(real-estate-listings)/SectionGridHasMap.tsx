"use client";

import React, { FC, useState, useEffect } from "react";
import AnyReactComponent from "@/components/AnyReactComponent/AnyReactComponent";
import GoogleMapReact from "google-map-react";
import { DEMO_STAY_LISTINGS } from "@/data/listings";
import ButtonClose from "@/shared/ButtonClose";
import Checkbox from "@/shared/Checkbox";
import Pagination from "@/shared/Pagination";
import TabFilters from "./TabFilters";
import Heading2 from "@/shared/Heading2";
import PropertyCardH from "@/components/PropertyCardH";
import { useSearchParams } from "next/navigation";

const DEMO_EXPERIENCES = DEMO_STAY_LISTINGS.filter((_, i) => i < 12);

export interface SectionGridHasMapProps {}

const SectionGridHasMap: FC<SectionGridHasMapProps> = () => {
  const [currentHoverID, setCurrentHoverID] = useState<string | number>(-1);
  const [showFullMapFixed, setShowFullMapFixed] = useState(false);
  const searchParams = useSearchParams();
  
  // Extract search parameters
  const category = searchParams?.get("category") || "Experiences";
  const query = searchParams?.get("query") || "";
  const distance = searchParams?.get("distance") || "0-10";
  const filters = searchParams?.get("filters") || "";
  
  // Parse the distance range
  const [minDistance, maxDistance] = distance.split("-").map(d => parseInt(d, 10) || 0);
  
  // Format the filters for display
  const filtersList = filters ? filters.split(',') : [];
  
  // Generate heading text based on search parameters
  const getHeadingText = () => {
    if (query) {
      return `${category} in ${query}`;
    }
    return `${category} near you`;
  };
  
  // Generate subheading text
  const getSubheadingText = () => {
    const parts = [];
    parts.push(`${DEMO_EXPERIENCES.length} experiences`);
    
    if (searchParams?.get("dates")) {
      parts.push(searchParams.get("dates"));
    } else {
      parts.push("Aug 12 - 18");
    }
    
    if (searchParams?.get("guests")) {
      parts.push(`${searchParams.get("guests")} Guests`);
    } else {
      parts.push("2 Guests");
    }
    
    return parts.join(" · ");
  };

  // Additional subheading for selected filters
  const getFiltersSubheading = () => {
    const parts = [];
    
    if (filtersList.length > 0) {
      parts.push(`Filters: ${filtersList.join(', ')}`);
    }
    
    return parts.join(' · ');
  };

  return (
    <div>
      <div className="relative flex min-h-screen">
        {/* CARDSSSS */}
        <div className="min-h-screen w-full xl:w-[780px] 2xl:w-[880px] flex-shrink-0 xl:px-8 ">
          <Heading2
            heading={getHeadingText()}
            subHeading={
              <div>
                <span className="block text-neutral-500 dark:text-neutral-400 mt-3">
                  {getSubheadingText()}
                </span>
                {filtersList.length > 0 && (
                  <span className="block text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
                    {getFiltersSubheading()}
                  </span>
                )}
              </div>
            }
          />
          <div className="mb-8 lg:mb-11">
            <TabFilters />
          </div>
          <div className="grid grid-cols-1 gap-8">
            {DEMO_EXPERIENCES.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setCurrentHoverID((_) => item.id)}
                onMouseLeave={() => setCurrentHoverID((_) => -1)}
              >
                <PropertyCardH data={item} />
              </div>
            ))}
          </div>
          <div className="flex mt-16 justify-center items-center">
            <Pagination />
          </div>
        </div>

        <div
          className="flex xl:hidden items-center justify-center fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-neutral-900 text-white shadow-2xl rounded-full z-30  space-x-3 text-sm cursor-pointer"
          onClick={() => setShowFullMapFixed(true)}
        >
          <i className="text-lg las la-map"></i>
          <span>Show map</span>
        </div>

        {/* MAPPPPP */}
        <div
          className={`xl:flex-grow xl:static xl:block ${
            showFullMapFixed ? "fixed inset-0 z-50" : "hidden"
          }`}
        >
          {showFullMapFixed && (
            <ButtonClose
              onClick={() => setShowFullMapFixed(false)}
              className="bg-white absolute z-50 left-3 top-3 shadow-lg rounded-xl w-10 h-10"
            />
          )}

          <div className="fixed xl:sticky top-0 xl:top-[88px] left-0 w-full h-full xl:h-[calc(100vh-88px)] rounded-md overflow-hidden">
            <div className="absolute bottom-5 left-3 lg:bottom-auto lg:top-2.5 lg:left-1/2 transform lg:-translate-x-1/2 py-2 px-4 bg-white shadow-xl z-10 rounded-2xl min-w-max">
              <Checkbox
                className="text-xs xl:text-sm text-neutral-800"
                name="xx"
                label="Search as I move the map"
              />
            </div>

            <GoogleMapReact
              bootstrapURLKeys={{
                key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAQD5YvZZew6WTYNXxjDbmtbKtYFB2eGmk",
              }}
              yesIWantToUseGoogleMapApiInternals
              defaultZoom={12}
              defaultCenter={DEMO_EXPERIENCES[0].map}
            >
              {DEMO_EXPERIENCES.map((item) => (
                <AnyReactComponent
                  isSelected={currentHoverID === item.id}
                  key={item.id}
                  lat={item.map.lat}
                  lng={item.map.lng}
                  experiences={item}
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
