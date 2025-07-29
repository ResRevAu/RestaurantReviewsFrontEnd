import React, { FC } from "react";
import Image from "next/image";
import BackgroundSection from "@/components/BackgroundSection";

export interface SectionAppNewsletterProps {
  className?: string;
}

const SectionAppNewsletter: FC<SectionAppNewsletterProps> = ({ className = "" }) => {
  return (
    <div
      className={`nc-SectionAppNewsletter relative py-16 ${className}`}
      data-nc-id="SectionAppNewsletter"
    >
      <BackgroundSection className="bg-neutral-100 dark:bg-black dark:bg-opacity-20" />
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center">
                        {/* Left Section - Mobile App Mockup */}
                  <div className="flex-shrink-0 mb-10 lg:mb-0 lg:mr-10 lg:w-2/5">
                    <Image
                      alt="Restaurant Reviews Mobile App"
                      src="/images/mobile-app-mockup.png"
                      width={400}
                      height={600}
                      className="mx-auto transition-transform duration-300 ease-in-out hover:scale-110"
                    />
                  </div>

      {/* Right Section - Text Content and QR Code */}
      <div className="flex-grow">
        <div className="max-w-4xl">
          {/* App Icon and Heading */}
                      <div className="flex items-center mb-6">
              {/* Replace this div with your custom app icon image */}
              <div className="w-20 h-18 rounded-xl shadow-md flex items-center justify-center mr-4 relative">
                {/* Option 1: Use SVG icon (current) - COMMENTED OUT */}
                {/* <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11,9H9V2H7v7H5V2H3v7c0,2.12,1.66,3.84,3.75,3.97V22h2.5v-9.03C11.34,12.84,13,11.12,13,9V2h-2V9z M16,6v8h2.5v8H21V2C18.24,2,16,4.24,16,6z"/>
                </svg> */}
                
                {/* Option 2: Use custom image - NOW ACTIVE */}
                <Image 
                  src="/images/app-icon.png" 
                  alt="Restaurant Reviews App Icon" 
                  width={48} 
                  height={48} 
                  className="w-20 h-18"
                />
                
                {/* Speech bubble tail */}
                {/* <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-b from-orange-400 to-red-500 transform rotate-45"></div> */}
              </div>
            <h2 className="font-bold text-3xl lg:text-4xl text-gray-900">
              Restaurant Reviews - Get the App
            </h2>
          </div>
          
          {/* Text Content and QR Code in same row */}
          <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Text Content */}
            <div className="flex-1 space-y-4 text-gray-700">
              <p className="text-lg">
                Scan the QR Code to download the Restaurant Reviews App on your Phone
              </p>
              <p className="text-lg">
                Its Free - <em>(No in app purchases required)</em>
              </p>
              <p className="text-lg">
                View your next meal before you order it – any where – any time!
              </p>
            </div>
            
            {/* QR Code */}
            <div className="flex-shrink-0">
              <Image 
                alt="QR Code for Restaurant Reviews App" 
                src="/images/qr-code.png" 
                width={200}
                height={200}
                className="border-2 border-gray-200 rounded-lg"
              />
            </div>
          </div>
          
                                {/* App Store Buttons */}
                      <div className="flex flex-row space-x-4 mt-8">
                        {/* App Store Button */}
                        <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 cursor-pointer transition-all duration-200 hover:shadow-lg">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                          <div>
                            <div className="text-xs">Available on the</div>
                            <div className="text-sm font-bold">App Store</div>
                          </div>
                        </div>

                        {/* Google Play Button */}
                        <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 cursor-pointer transition-all duration-200 hover:shadow-lg">
                          <svg className="w-8 h-8" viewBox="0 0 24 24">
                            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" fill="#4285F4"/>
                            <path d="M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12Z" fill="#EA4335"/>
                            <path d="M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81Z" fill="#FBBC04"/>
                            <path d="M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" fill="#34A853"/>
                          </svg>
                          <div>
                            <div className="text-xs">GET IT ON</div>
                            <div className="text-sm font-bold">Google Play</div>
                          </div>
                        </div>
                      </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default SectionAppNewsletter; 