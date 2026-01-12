"use client";

import React from "react";
import Input from "@/shared/Input";

interface Step4AccountDetailsProps {
  formData: {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const Step4AccountDetails: React.FC<Step4AccountDetailsProps> = ({
  formData,
  handleChange,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Account Details
      </h2>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

      <div className="space-y-6">
        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200">
            Username <span className="text-red-500">*</span>
          </span>
          <Input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
            className="mt-1"
            required
          />
        </label>

        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200">
            Email address <span className="text-red-500">*</span>
          </span>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@example.com"
            className="mt-1"
            required
          />
        </label>

        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200">
            Password <span className="text-red-500">*</span>
          </span>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="mt-1"
            required
          />
        </label>

        <label className="block">
          <span className="text-neutral-800 dark:text-neutral-200">
            Confirm Password <span className="text-red-500">*</span>
          </span>
          <Input
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="Confirm password"
            className="mt-1"
            required
          />
        </label>
      </div>
    </div>
  );
};

export default Step4AccountDetails;

