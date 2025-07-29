import React, { FC } from "react";
import SectionGridHasMap from "../SectionGridHasMap";
import SectionHero1 from "@/app/(server-components)/SectionHero1";

export interface ListingStayMapPageProps {
  // Even if not used directly, defining params and searchParams can help Next.js
  params?: {}; 
  searchParams?: { [key: string]: string | string[] | undefined };
}

const ListingStayMapPage: FC<ListingStayMapPageProps> = ({ params, searchParams }) => {
  // You can optionally log here too to double-check
  console.log("Page searchParams:", searchParams);

  return (
    <>
      {/* Search Section */}
      <SectionHero1 className="" />
      
      {/* Map & Results Section */}
      <div className="container pb-24 lg:pb-28 2xl:pl-10 xl:pr-0 xl:max-w-none">
        <SectionGridHasMap />
      </div>
    </>
  );
};

export default ListingStayMapPage;
