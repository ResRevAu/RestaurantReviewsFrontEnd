import React from "react";
import NavigationItem from "./NavigationItem";
import { PathName } from "@/routers/types";

const NAVIGATION_ITEMS = [
  { id: "find-food", name: "Find Food", href: "/" as PathName },
  { id: "post-review", name: "Post a Review", href: "/post-review" as PathName },
  { id: "services", name: "Our Services", href: "/services" as PathName },
  { id: "list-venue", name: "List Your Venue", href: "/add-listing/1" as PathName },
  { id: "support-contact", name: "Support / Contact", href: "/contact" as PathName },
];

function Navigation() {
  return (
    <ul className="nc-Navigation hidden lg:flex lg:items-center lg:justify-between lg:space-x-2 
    relative text-white" style={{ marginLeft: '10%' }}>
      {NAVIGATION_ITEMS.map((item) => (
        <NavigationItem key={item.id} menuItem={item} />
      ))}

    </ul>
  );
}

export default Navigation;
