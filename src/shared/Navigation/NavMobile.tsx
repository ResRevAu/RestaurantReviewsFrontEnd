"use client";

import React from "react";
import { NAVIGATION_DEMO } from "@/data/navigation";
import ButtonClose from "@/shared/ButtonClose";
import Logo from "@/shared/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PathName } from "@/routers/types";
import { 
  HomeIcon, 
  InformationCircleIcon, 
  ChatBubbleLeftRightIcon,
  NewspaperIcon,
  CreditCardIcon,
  UserCircleIcon,
  HeartIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";

export interface NavMobileProps {
  onClickClose?: () => void;
}

interface ExtendedNavItem {
  id: string;
  href: PathName;
  name: string;
  icon: React.ElementType;
}

// Extended navigation with icons
const EXTENDED_NAV: ExtendedNavItem[] = [
  {
    id: "find-food",
    href: "/" as PathName,
    name: "Find Food",
    icon: HomeIcon,
  },
  { id: "post-review", name: "Post a Review", href: "/post-review" as PathName, icon: HomeIcon },
  { id: "services", name: "Our Services", href: "/services" as PathName, icon: HomeIcon },
  { id: "list-venue", name: "List Your Venue", href: "/add-listing/1" as PathName, icon: HomeIcon },
  { id: "support-contact", name: "Support/ Contact", href: "/contact" as PathName, icon: HomeIcon },
  {
    id: "about",
    href: "/about" as PathName,
    name: "About Us",
    icon: InformationCircleIcon,
  },
  {
    id: "contact",
    href: "/contact" as PathName,
    name: "Contact",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    id: "blog",
    href: "/blog" as PathName,
    name: "Blog",
    icon: NewspaperIcon,
  },
  {
    id: "subscription",
    href: "/subscription" as PathName,
    name: "Subscription",
    icon: CreditCardIcon,
  },
  {
    id: "account",
    href: "/account" as PathName,
    name: "My Account",
    icon: UserCircleIcon,
  },
  {
    id: "wishlist",
    href: "/account-savelists" as PathName,
    name: "My Wishlist",
    icon: HeartIcon,
  },
  {
    id: "help",
    href: "/help" as PathName,
    name: "Help & FAQ",
    icon: QuestionMarkCircleIcon,
  },
];

const NavMobile: React.FC<NavMobileProps> = ({ onClickClose }) => {
  const pathname = usePathname();

  return (
    <div className="overflow-y-auto w-full h-screen py-2 transition-all">
      <div className="px-5 flex items-center justify-between py-4 space-x-4 border-b border-neutral-200 dark:border-neutral-700">
        <Logo />
        <ButtonClose onClick={onClickClose} />
      </div>
      
      <div className="px-2 py-3">
        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 px-4 py-2">MAIN MENU</h3>
        <ul className="flex flex-col space-y-1 mt-1">
          {EXTENDED_NAV.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center w-full px-4 py-3 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-900 dark:bg-primary-900 dark:text-primary-100"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }`}
                  onClick={onClickClose}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-primary-600 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"}`} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-2"></div>
      
      <div className="px-2 py-3">
        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 px-4 py-2">YOUR ACCOUNT</h3>
        <ul className="flex flex-col space-y-1 mt-1">
          {EXTENDED_NAV.slice(5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center w-full px-4 py-3 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-900 dark:bg-primary-900 dark:text-primary-100"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }`}
                  onClick={onClickClose}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-primary-600 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"}`} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="px-6 py-8 text-center">
        <button 
          className="px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors"
          onClick={onClickClose}
        >
          Close Menu
        </button>
      </div>
    </div>
  );
};

export default NavMobile;
