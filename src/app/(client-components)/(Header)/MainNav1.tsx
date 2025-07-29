import React, { FC } from "react";
import Logo from "@/shared/Logo";
import Navigation from "@/shared/Navigation/Navigation";
import ButtonPrimary from "@/shared/ButtonPrimary";
import MenuBar from "@/shared/MenuBar";
import HeroSearchForm2MobileFactory from "../(HeroSearchForm2Mobile)/HeroSearchForm2MobileFactory";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
import { Route } from "@/routers/types";

export interface MainNav1Props {
  className?: string;
}

const MainNav1: FC<MainNav1Props> = ({ className = "" }) => {
  const { isAuthenticated, user, logout, authState } = useAuth();

  // This will force a re-render when authState changes
  React.useEffect(() => {
    // This effect will run whenever authState changes
  }, [authState]);

  return (
    <div className={`nc-MainNav1 relative z-10 bg-black ${className}`}>
      <div className="px-4 lg:container h-20 relative flex justify-between">
        <div className="hidden md:flex justify-start flex-1 space-x-4 sm:space-x-10">
          <Logo className="w-24 self-center" />
          <Navigation />
        </div>

        <div className="flex lg:hidden flex-[3] max-w-lg !mx-auto md:px-3 ">
          <div className="self-center flex-1">
            <HeroSearchForm2MobileFactory />
          </div>
        </div>

        <div className="hidden md:flex flex-shrink-0 justify-end flex-1 lg:flex-none text-white">
          <div className="hidden xl:flex items-center space-x-3">
            {isAuthenticated && (
              <>
                <NotifyDropdown className="flex items-center" />
                <div className="px-1" />
                <div className="flex items-center space-x-2">
                  <AvatarDropdown
                    imgUrl={user?.profile_picture}
                    userName={user?.username}
                    sizeClass="w-8 h-8"
                  />
                </div>
              </>
            )}
            
            <ButtonPrimary 
              className="self-center bg-[#87e64b] hover:bg-[#84e049] transition-all duration-300 rounded-md" 
              href={"/manage-restaurant" as Route}
            >
              Manage My Restaurant
            </ButtonPrimary>
          </div>

          <div className="flex xl:hidden items-center">
            <MenuBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav1;
