"use client";

import React from "react";
import Image from "next/image";
import Input from "@/shared/Input";

interface Step1PersonalInfoProps {
  formData: {
    first_name: string;
    last_name: string;
    phone_number: string;
    about_me: string;
    gender: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSocialLogin: (provider: string) => void;
  socialLoginUsed: boolean;
  loginSocials: Array<{ name: string; href: string; icon: any }>;
}

const genderOptions = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "O", label: "Other" },
  { value: "N", label: "Prefer not to say" },
];

const Step1PersonalInfo: React.FC<Step1PersonalInfoProps> = ({
  formData,
  handleChange,
  handleSocialLogin,
  socialLoginUsed,
  loginSocials,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Personal Information
      </h2>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

      {!socialLoginUsed && (
        <>
          {/* Social Login Options */}
          <div className="grid gap-3">
            {loginSocials.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSocialLogin(item.name.toLowerCase().replace("continue with ", ""))}
                className="nc-will-change-transform flex w-full rounded-lg bg-primary-50 dark:bg-neutral-800 px-4 py-3 transform transition-transform sm:px-6 hover:translate-y-[-2px]"
              >
                <Image
                  className="flex-shrink-0"
                  src={item.icon}
                  alt={item.name}
                />
                <h3 className="flex-grow text-center text-sm font-medium text-neutral-700 dark:text-neutral-300 sm:text-sm">
                  {item.name}
                </h3>
              </button>
            ))}
          </div>

          <div className="relative text-center">
            <span className="relative z-10 inline-block px-4 font-medium text-sm bg-white dark:text-neutral-400 dark:bg-neutral-900">
              OR
            </span>
            <div className="absolute left-0 w-full top-1/2 transform -translate-y-1/2 border border-neutral-100 dark:border-neutral-800"></div>
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
            Enter Personal Info
          </p>
        </>
      )}

      {/* Personal Info Form */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200">
              First Name
            </span>
            <Input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter First name"
              className="mt-1"
            />
          </label>

          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200">
              Last Name
            </span>
            <Input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Enter Last name"
              className="mt-1"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200">
            Phone Number
          </span>
          <Input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Enter phone number"
            className="mt-1"
          />
        </label>

        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200">
            About Me
          </span>
          <textarea
            name="about_me"
            value={formData.about_me}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            className="mt-1 block w-full rounded-lg border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 h-24 px-4 py-3"
            rows={3}
          />
        </label>

        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200">
            Gender
          </span>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 h-11 px-4 py-3"
          >
            <option value="">Select gender</option>
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

export default Step1PersonalInfo;

