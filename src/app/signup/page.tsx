"use client";
import React, { FC, useState } from "react";
import facebookSvg from "@/images/Facebook.svg";
import twitterSvg from "@/images/Twitter.svg";
import googleSvg from "@/images/Google.svg";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Image from "next/image";
import Link from "next/link";
import Alert from "@/shared/Alert";
import { useRouter } from "next/navigation";
import Step1PersonalInfo from "@/components/signup/Step1PersonalInfo";
import Step2RestaurantSelection from "@/components/signup/Step2RestaurantSelection";
import Step3PlanSelection from "@/components/signup/Step3PlanSelection";
import Step4AccountDetails from "@/components/signup/Step4AccountDetails";

export interface PageSignUpProps {}

const loginSocials = [
  {
    name: "Continue with Facebook",
    href: "#",
    icon: facebookSvg,
  },
  {
    name: "Continue with Twitter",
    href: "#",
    icon: twitterSvg,
  },
  {
    name: "Continue with Google",
    href: "#",
    icon: googleSvg,
  },
];

const userTypes = [
  { value: "CUSTOMER", label: "Customer" },
  { value: "OWNER", label: "Restaurant Owner" },
];

const steps = [
  { id: 1, name: "Personal Info", label: "Personal Info" },
  { id: 2, name: "Restaurant", label: "Select or Add Restaurant" },
  { id: 3, name: "Plan", label: "Choose Plan" },
  { id: 4, name: "Account", label: "Account Details" },
];

const PageSignUp: FC<PageSignUpProps> = ({}) => {
  const router = useRouter();
  const [selectedUserType, setSelectedUserType] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [socialLoginUsed, setSocialLoginUsed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Form data across all steps
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    first_name: "",
    last_name: "",
    phone_number: "",
    about_me: "",
    gender: "",
    
    // Step 2: Restaurant
    restaurant_id: null as number | null,
    restaurant_name: "",
    restaurant_phone: "",
    restaurant_website: "",
    restaurant_email: "",
    restaurant_address: "",
    restaurant_unit_number: "",
    restaurant_street_number: "",
    restaurant_street_name: "",
    restaurant_suburb: "",
    restaurant_state: "",
    restaurant_postcode: "",
    restaurant_country: "Australia",
    
    // Step 3: Plan
    selected_plan_id: null as number | null,
    
    // Step 4: Account Details
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    user_type: "",
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "error",
    message: "",
  });

  const handleUserTypeSelect = (type: string) => {
    setSelectedUserType(type);
    setFormData(prev => ({ ...prev, user_type: type }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialLogin = (provider: string) => {
    // Handle social login - for now just mark as used
    setSocialLoginUsed(true);
    // Mark step 1 as completed
    if (!completedSteps.includes(1)) {
      setCompletedSteps([...completedSteps, 1]);
    }
    setCurrentStep(2); // Skip to restaurant selection after social login
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Allow clicking on current step (no-op)
    if (stepId === currentStep) {
      return;
    }

    // Always allow going back to any previous step
    if (stepId < currentStep) {
      setCurrentStep(stepId);
      return;
    }

    // For going forward, check if we can access the step
    // Step 1: Always accessible
    if (stepId === 1) {
      setCurrentStep(stepId);
      return;
    }

    // Step 2: Check if step 1 is completed or can be validated
    if (stepId === 2) {
      const step1Valid = socialLoginUsed || 
                        completedSteps.includes(1) || 
                        (formData.first_name && formData.last_name);
      
      if (step1Valid) {
        setCurrentStep(stepId);
      } else {
        setAlert({
          show: true,
          type: "error",
          message: "Please complete Step 1 (Personal Info) before proceeding",
        });
      }
      return;
    }

    // Step 3: Check if step 2 is completed or can be validated
    if (stepId === 3) {
      const step2Valid = completedSteps.includes(2) || 
                        formData.restaurant_id !== null || 
                        (formData.restaurant_name && formData.restaurant_street_number && formData.restaurant_street_name);
      
      if (step2Valid) {
        setCurrentStep(stepId);
      } else {
        setAlert({
          show: true,
          type: "error",
          message: "Please complete Step 2 (Select or Add Restaurant) before proceeding",
        });
      }
      return;
    }

    // Step 4: Check if step 3 is completed or can be validated
    if (stepId === 4) {
      const step3Valid = completedSteps.includes(3) || formData.selected_plan_id !== null;
      
      if (step3Valid) {
        setCurrentStep(stepId);
      } else {
        setAlert({
          show: true,
          type: "error",
          message: "Please complete Step 3 (Choose Plan) before proceeding",
        });
      }
      return;
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // If social login was used, skip validation
        if (socialLoginUsed) return true;
        // Otherwise validate personal info
        if (!formData.first_name || !formData.last_name) {
          setAlert({
            show: true,
            type: "error",
            message: "Please fill in First Name and Last Name",
          });
          return false;
        }
        return true;
      
      case 2:
        // Must either select a restaurant or add new one
        if (!formData.restaurant_id && !formData.restaurant_name) {
          setAlert({
            show: true,
            type: "error",
            message: "Please select an existing restaurant or add a new one",
          });
          return false;
        }
        // If adding new, validate required fields
        if (!formData.restaurant_id && formData.restaurant_name) {
          if (!formData.restaurant_street_number || !formData.restaurant_street_name || 
              !formData.restaurant_suburb || !formData.restaurant_state || !formData.restaurant_postcode) {
            setAlert({
              show: true,
              type: "error",
              message: "Please fill in all required address fields",
            });
            return false;
          }
        }
        return true;
      
      case 3:
        if (!formData.selected_plan_id) {
          setAlert({
            show: true,
            type: "error",
            message: "Please select a subscription plan",
          });
          return false;
        }
        return true;
      
      case 4:
        return validateForm();
      
      default:
        return true;
    }
  };

  const validateForm = () => {
    // Username validation
    if (formData.username.length < 3) {
      setAlert({
        show: true,
        type: "error",
        message: "Username must be at least 3 characters long",
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setAlert({
        show: true,
        type: "error",
        message: "Please enter a valid email address",
      });
      return false;
    }

    // Password validation
    if (formData.password.length < 8) {
      setAlert({
        show: true,
        type: "error",
        message: "Password must be at least 8 characters long",
      });
      return false;
    }

    // Password confirmation
    if (formData.password !== formData.confirm_password) {
      setAlert({
        show: true,
        type: "error",
        message: "Passwords do not match",
      });
      return false;
    }

    return true;
  };

  const handleStepNext = () => {
    if (validateStep(currentStep)) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      if (currentStep === steps.length) {
        handleSubmit();
      } else {
        handleNextStep();
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare API data
      const apiData: any = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        user_type: "OWNER",
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        about_me: formData.about_me,
        gender: formData.gender,
      };

      // Add restaurant data if adding new restaurant
      if (!formData.restaurant_id && formData.restaurant_name) {
        apiData.restaurant = {
          name: formData.restaurant_name,
          phone: formData.restaurant_phone,
          website: formData.restaurant_website,
          email: formData.restaurant_email,
          street_address: formData.restaurant_street_name,
          room_number: formData.restaurant_unit_number,
          street_number: formData.restaurant_street_number,
          city: formData.restaurant_suburb,
          state: formData.restaurant_state,
          postal_code: formData.restaurant_postcode,
          country: formData.restaurant_country,
        };
      } else if (formData.restaurant_id) {
        apiData.restaurant_id = formData.restaurant_id;
      }

      // Add subscription plan
      if (formData.selected_plan_id) {
        apiData.subscription_plan_id = formData.selected_plan_id;
      }
      
      console.log('Sending registration data:', JSON.stringify(apiData, null, 2));
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://restaurantreviews.io';
      const response = await fetch(`${apiBaseUrl}/api/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(apiData),
      });

      let data;
      const responseText = await response.text();
      console.log('Raw server response:', responseText);
      
      try {
        data = JSON.parse(responseText);
        console.log('Parsed server response:', data);
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        if (response.status === 400) {
          if (data.error) {
            if (typeof data.error === 'object') {
              const errors = Object.entries(data.error)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
                .join(', ');
              throw new Error(errors);
            }
            throw new Error(data.error);
          } else if (data.errors) {
            const errors = Object.entries(data.errors)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
              .join(', ');
            throw new Error(errors);
          }
        }
        throw new Error(`Registration failed. Status: ${response.status}. ${JSON.stringify(data)}`);
      }

      setAlert({
        show: true,
        type: "success",
        message: "Registration successful! Redirecting to login...",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      setAlert({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // If user type not selected, show selection screen
  if (!selectedUserType) {
    return (
      <div className={`nc-PageSignUp`}>
        <Alert 
          show={alert.show}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(prev => ({ ...prev, show: false }))}
        />
        <div className="container mb-24 lg:mb-32">
          <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
            Signup
          </h2>
          <div className="max-w-md mx-auto space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-center text-neutral-900 dark:text-neutral-100">
                Select User Type
              </h3>
              <div className="grid gap-4">
                {userTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleUserTypeSelect(type.value)}
                    className="w-full py-4 px-6 rounded-lg bg-primary-50 dark:bg-neutral-800 hover:bg-primary-100 dark:hover:bg-neutral-700 transition-colors text-neutral-900 dark:text-neutral-100 font-medium"
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="block text-center text-neutral-700 dark:text-neutral-300">
              Already have an account? {` `}
              <Link href="/login" className="font-semibold underline">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If Customer type, show original form
  if (selectedUserType === "CUSTOMER") {
    return (
      <div className={`nc-PageSignUp`}>
        <Alert 
          show={alert.show}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(prev => ({ ...prev, show: false }))}
        />
        <div className="container mb-24 lg:mb-32">
          <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
            Signup
          </h2>
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex items-center justify-between p-4 mb-6 rounded-lg bg-primary-50 dark:bg-neutral-800">
              <div className="flex items-center">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Registering as:
                </span>
                <span className="ml-2 font-semibold text-primary-900 dark:text-primary-100">
                  Customer
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedUserType("");
                  setFormData(prev => ({ ...prev, user_type: "" }));
                }}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                Change
              </button>
            </div>

            <div className="grid gap-3">
              {loginSocials.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
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
                </a>
              ))}
            </div>
            <div className="relative text-center">
              <span className="relative z-10 inline-block px-4 font-medium text-sm bg-white dark:text-neutral-400 dark:bg-neutral-900">
                OR
              </span>
              <div className="absolute left-0 w-full top-1/2 transform -translate-y-1/2 border border-neutral-100 dark:border-neutral-800"></div>
            </div>
            
            <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
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
                  className="mt-1"
                  required
                />
              </label>

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
                    placeholder="First name"
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
                    placeholder="Last name"
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
                  className="mt-1 block w-full rounded-lg border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
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
                  className="mt-1 block w-full rounded-lg border-neutral-200 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                  <option value="N">Prefer not to say</option>
                </select>
              </label>

              <ButtonPrimary type="submit" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </ButtonPrimary>
            </form>

            <span className="block text-center text-neutral-700 dark:text-neutral-300">
              Already have an account? {` `}
              <Link href="/login" className="font-semibold underline">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Restaurant Owner multi-step form
  return (
    <div className={`nc-PageSignUp`}>
      <Alert 
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert(prev => ({ ...prev, show: false }))}
      />
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Restaurant Owner Registration
        </h2>

        {/* Step Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              
              // Determine if step is accessible
              let isAccessible = false;
              if (step.id === 1) {
                isAccessible = true; // Step 1 is always accessible
              } else if (step.id === 2) {
                isAccessible = step.id <= currentStep || 
                              socialLoginUsed || 
                              completedSteps.includes(1) || 
                              !!(formData.first_name && formData.last_name);
              } else if (step.id === 3) {
                isAccessible = step.id <= currentStep || 
                              completedSteps.includes(2) || 
                              formData.restaurant_id !== null || 
                              !!(formData.restaurant_name && formData.restaurant_street_number);
              } else if (step.id === 4) {
                isAccessible = step.id <= currentStep || 
                              completedSteps.includes(3) || 
                              formData.selected_plan_id !== null;
              }
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      disabled={!isAccessible && step.id > currentStep}
                      className={`group flex flex-col items-center flex-1 transition-all ${
                        isAccessible
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                          isCurrent
                            ? "bg-green-600 text-white ring-4 ring-green-200 dark:ring-green-900 scale-110"
                            : isCompleted
                            ? "bg-green-600 text-white"
                            : currentStep > step.id
                            ? "bg-green-600 text-white"
                            : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                        } ${
                          isAccessible && !isCurrent
                            ? "hover:scale-105 hover:ring-2 hover:ring-green-300 dark:hover:ring-green-700"
                            : ""
                        }`}
                      >
                        {isCompleted && !isCurrent ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.id
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium text-center transition-colors ${
                          isCurrent
                            ? "text-green-600 font-semibold"
                            : isCompleted || currentStep > step.id
                            ? "text-green-600"
                            : "text-neutral-500 dark:text-neutral-400"
                        } ${
                          isAccessible && !isCurrent
                            ? "group-hover:text-green-700 dark:group-hover:text-green-400"
                            : ""
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${
                        currentStep > step.id || completedSteps.includes(step.id + 1)
                          ? "bg-green-600"
                          : "bg-neutral-200 dark:bg-neutral-700"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 1 && (
            <Step1PersonalInfo
              formData={formData}
              handleChange={handleChange}
              handleSocialLogin={handleSocialLogin}
              socialLoginUsed={socialLoginUsed}
              loginSocials={loginSocials}
            />
          )}
          
          {currentStep === 2 && (
            <Step2RestaurantSelection
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
            />
          )}
          
          {currentStep === 3 && (
            <Step3PlanSelection
              formData={formData}
              setFormData={setFormData}
            />
          )}
          
          {currentStep === 4 && (
            <Step4AccountDetails
              formData={formData}
              handleChange={handleChange}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <ButtonSecondary
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
            >
              Previous
            </ButtonSecondary>
            <ButtonPrimary
              onClick={handleStepNext}
              disabled={loading}
            >
              {currentStep === steps.length ? (loading ? "Signing up..." : "Sign Up") : "Next"}
            </ButtonPrimary>
          </div>
        </div>

        <span className="block text-center text-neutral-700 dark:text-neutral-300 mt-8">
          Already have an account? {` `}
          <Link href="/login" className="font-semibold underline">
            Sign in
          </Link>
        </span>
      </div>
    </div>
  );
};

export default PageSignUp;
