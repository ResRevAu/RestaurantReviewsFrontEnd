import React from "react";
import logoImg from "@/images/logo.png";
import logoLightImg from "@/images/logo-light.png";
import LogoSvgLight from "./LogoSvgLight";
import LogoSvg from "./LogoSvg";
import Link from "next/link";
import { StaticImageData } from "next/image";
import Image from "next/image";

export interface LogoProps {
  img?: StaticImageData;
  imgLight?: StaticImageData;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  img = logoImg,
  imgLight = logoLightImg,
  className = "w-24",
}) => {
  return (
    <Link
      href="/"
      className={`ttnc-logo inline-block text-primary-6000 focus:outline-none focus:ring-0 ${className} flex items-center`}
    >
      {/* Original SVG logos - comment out but keep for reference */}
      {/* <LogoSvgLight />
      <LogoSvg /> */}

      {/* Restaurant logo with text */}
      <div className="flex items-center justify-center">
        {/* Logo image */}
        <div className="w-16 h-16 relative">
          <Image 
            src="/images/RRLogo.png" 
            alt="Restaurant Reviews Logo" 
            width={100} 
            height={100}
            className="object-contain" 
          />
        </div>
        
        {/* Text beside logo */}
        <div className="ml-3 flex flex-col">
          <span className="text-xl font-extrabold leading-none text-white">Restaurant</span>
          <span className="text-xl font-extrabold leading-none text-white">Reviews</span>
        </div>
      </div>

      {/* THIS USE FOR MY CLIENT */}
      {/* PLEASE UN COMMENT BELLOW CODE AND USE IT */}
      {/* {img ? (
        <img
          className={`block max-h-12 ${imgLight ? "dark:hidden" : ""}`}
          src={img}
          alt="Logo"
        />
      ) : (
        "Logo Here"
      )}
      {imgLight && (
        <img
          className="hidden max-h-12 dark:block"
          src={imgLight}
          alt="Logo-Light"
        />
      )} */}
    </Link>
  );
};

export default Logo;
