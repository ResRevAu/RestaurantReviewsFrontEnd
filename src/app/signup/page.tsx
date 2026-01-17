"use client";
import React, { FC, useState, useEffect } from "react";
import facebookSvg from "@/images/Facebook.svg";
import facebookWhiteSvg from "@/images/FacebookWhite.svg";
import xWhiteSvg from "@/images/XWhite.svg";
import xBlackSvg from "@/images/XBlack.svg";
import googleSvg from "@/images/Google.svg";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import Image from "next/image";
import Link from "next/link";
import Alert from "@/shared/Alert";
import { useRouter } from "next/navigation";
import Step1UserDetails from "@/components/signup/Step1UserDetails";
import Step2RestaurantSelection from "@/components/signup/Step2RestaurantSelection";
import { authenticateWithFacebook, authenticateWithGoogle, storeAuthData, SocialAuthResponse } from "@/services/socialAuth";

export interface PageSignUpProps {}

const loginSocials = [
  {
    name: "Continue with Facebook",
    href: "#",
    icon: facebookWhiteSvg, // White icon for blue button
    iconDark: facebookSvg, // Dark icon for light backgrounds
  },
  {
    name: "Continue with X",
    href: "#",
    icon: xWhiteSvg, // White icon for black button
    iconDark: xBlackSvg, // Black icon for light backgrounds
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
  { id: 1, name: "User Details", label: "User Details" },
  { id: 2, name: "Restaurant", label: "Select or Add Restaurant" },
];

const PageSignUp: FC<PageSignUpProps> = ({}) => {
  const router = useRouter();
  const [selectedUserType, setSelectedUserType] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [socialLoginUsed, setSocialLoginUsed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [userId, setUserId] = useState<number | null>(null); // Store user_id from Step 1
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false); // Track phone verification status
  
  // Form data across all steps
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    first_name: "",
    last_name: "",
    phone_number: "",
    
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
    restaurant_latitude: undefined as number | string | undefined,
    restaurant_longitude: undefined as number | string | undefined,
    ownership_proof: null as File | null,
    
    // Account Details
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
  
  // Track validation errors for each step
  const [stepErrors, setStepErrors] = useState<{
    [key: number]: { [field: string]: string };
  }>({});

  const handleUserTypeSelect = (type: string) => {
    setSelectedUserType(type);
    setFormData(prev => ({ ...prev, user_type: type }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (stepErrors[currentStep] && stepErrors[currentStep][name]) {
      setStepErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[currentStep]) {
          const stepErrorsCopy = { ...newErrors[currentStep] };
          delete stepErrorsCopy[name];
          newErrors[currentStep] = stepErrorsCopy;
        }
        return newErrors;
      });
    }
    
    // If user changes email or username in Step 1, clear any stored user_id
    // This ensures we always validate the new email/username when submitting
    if (currentStep === 1 && (name === 'email' || name === 'username') && !socialLoginUsed) {
      const storedUserId = sessionStorage.getItem('registration_user_id');
      if (storedUserId) {
        console.log(`Step 1: ${name} changed, clearing stored user_id to force new validation`);
        sessionStorage.removeItem('registration_user_id');
        setUserId(null);
      }
    }
  };

  // Handle file input changes (for ownership proof)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, ownership_proof: file }));
    
    // Clear error for ownership_proof when file is selected
    if (stepErrors[2] && stepErrors[2].ownership_proof) {
      setStepErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[2]) {
          const stepErrorsCopy = { ...newErrors[2] };
          delete stepErrorsCopy.ownership_proof;
          newErrors[2] = stepErrorsCopy;
        }
        return newErrors;
      });
    }
  };
  
  const handleSocialLogin = async (provider: string, token?: string, idToken?: string) => {
    try {
      setLoading(true);
      setAlert({ show: false, type: 'error', message: '' });

      let authResponse: SocialAuthResponse;
      
      if (provider === 'facebook' && token) {
        authResponse = await authenticateWithFacebook(token, 'OWNER');
      } else if (provider === 'google' && idToken) {
        authResponse = await authenticateWithGoogle(idToken, 'OWNER');
      } else {
        throw new Error('Invalid provider or missing token');
      }

      // IMPORTANT: Do NOT store tokens - user is NOT logged in yet
      // User must complete Steps 2 & 3 first
      
      // Store user_id in sessionStorage for Steps 2 & 3
      const socialUserId = authResponse.user_id || authResponse.user?.id;
      if (socialUserId) {
        setUserId(socialUserId);
        sessionStorage.setItem('registration_user_id', String(socialUserId));
        sessionStorage.setItem('is_social_auth', 'true');
      }

      // Mark social login as used
      setSocialLoginUsed(true);
      
      // Mark step 1 as completed
      if (!completedSteps.includes(1)) {
        setCompletedSteps([...completedSteps, 1]);
      }

      // ALWAYS proceed to Step 2 - social auth users must complete Step 2
      // No auto-login, no skipping steps
      if (authResponse.requires_step_2) {
        setCurrentStep(2);
      } else {
        // Fallback: Still go to Step 2 even if flag is false (shouldn't happen)
        console.warn('Social auth response indicates step 2 not required, but proceeding anyway');
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Social login error:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error instanceof Error ? error.message : 'Social login failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      // Validate current step and store errors
      const validation = validateStep(currentStep);
      setStepErrors(prev => ({ ...prev, [currentStep]: validation.errors }));
      
      // Mark current step as completed only if valid
      if (validation.isValid) {
        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps([...completedSteps, currentStep]);
        }
        setCurrentStep(currentStep + 1);
      } else {
        // Show alert if trying to proceed with errors
      setAlert({
        show: true,
        type: "error",
          message: "Please fill in all required fields before proceeding",
        });
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      // If navigating back to Step 1 and not using social login,
      // clear stored user_id to ensure Step 1 is called again with current form data
      if (currentStep === 2 && !socialLoginUsed) {
        const storedUserId = sessionStorage.getItem('registration_user_id');
        if (storedUserId) {
          console.log('Step 1: Navigating back to Step 1, clearing stored user_id to allow re-validation');
          sessionStorage.removeItem('registration_user_id');
          setUserId(null);
        }
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Allow clicking on current step (no-op)
    if (stepId === currentStep) {
      return;
    }

    // If navigating back to Step 1 and not using social login,
    // clear stored user_id to ensure Step 1 is called again with current form data
    if (stepId === 1 && currentStep > 1 && !socialLoginUsed) {
      const storedUserId = sessionStorage.getItem('registration_user_id');
      if (storedUserId) {
        console.log('Step 1: Clicking back to Step 1, clearing stored user_id to allow re-validation');
        sessionStorage.removeItem('registration_user_id');
        setUserId(null);
      }
    }

    // If moving forward, validate the current step and mark it red if invalid
    if (stepId > currentStep) {
      const currentStepValidation = validateStep(currentStep);
      setStepErrors(prev => ({ ...prev, [currentStep]: currentStepValidation.errors }));
    }

    // Validate the step being navigated to and show errors
    const validation = validateStep(stepId);
    setStepErrors(prev => ({ ...prev, [stepId]: validation.errors }));
    
    // Allow navigation to any step without blocking (form data persists in state)
    setCurrentStep(stepId);
  };

  const validateStep = (step: number): { isValid: boolean; errors: { [field: string]: string } } => {
    const errors: { [field: string]: string } = {};
    
    switch (step) {
      case 1:
        // If social login was used, skip validation
        if (socialLoginUsed) return { isValid: true, errors: {} };
        
        // Validate personal info
        if (!formData.first_name) {
          errors.first_name = "First Name is required";
        }
        if (!formData.last_name) {
          errors.last_name = "Last Name is required";
        }
        if (!formData.phone_number) {
          errors.phone_number = "Mobile Number is required";
        } else if (!phoneVerified) {
          errors.phone_number = "Please verify your mobile number before proceeding";
        }
        
        // Validate account details
        if (!formData.username) {
          errors.username = "Username is required";
        } else if (formData.username.length < 3) {
          errors.username = "Username must be at least 3 characters long";
        }
        
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
          errors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
          errors.email = "Please enter a valid email address";
        }
        
        if (!formData.password) {
          errors.password = "Password is required";
        } else if (formData.password.length < 8) {
          errors.password = "Password must be at least 8 characters long";
        }
        
        if (!formData.confirm_password) {
          errors.confirm_password = "Please confirm your password";
        } else if (formData.password !== formData.confirm_password) {
          errors.confirm_password = "Passwords do not match";
        }
        
        return { isValid: Object.keys(errors).length === 0, errors };
      
      case 2:
        // Must either select a restaurant or add new one
        if (!formData.restaurant_id && !formData.restaurant_name) {
          errors.restaurant_selection = "Please select an existing restaurant or add a new one";
        }
        
        // Validate ownership proof (required for both cases)
        if (!formData.ownership_proof) {
          errors.ownership_proof = "Ownership Proof (ASIC extract) is required";
        }
        
        // If adding new, validate required fields
        if (!formData.restaurant_id && formData.restaurant_name) {
          if (!formData.restaurant_street_number) {
            errors.restaurant_street_number = "Street Number is required";
          }
          if (!formData.restaurant_street_name) {
            errors.restaurant_street_name = "Street Name is required";
          }
          if (!formData.restaurant_suburb) {
            errors.restaurant_suburb = "Suburb is required";
          }
          if (!formData.restaurant_country) {
            errors.restaurant_country = "Country is required";
          }
        }
        
        return { isValid: Object.keys(errors).length === 0, errors };
      
      default:
        return { isValid: true, errors: {} };
    }
  };
  
  // Check if a step has errors (for visual indication)
  const checkStepHasErrors = (step: number): boolean => {
    const validation = validateStep(step);
    return !validation.isValid;
  };

  const validateForm = () => {
    // This is now handled in validateStep(1), but kept for backward compatibility
    return validateStep(1);
  };

  // Step 1: Just validate and move to next step (no API call)
  const handleStep1Complete = () => {
    // Check phone verification for non-social login users
    if (!socialLoginUsed && formData.phone_number && !phoneVerified) {
      setStepErrors(prev => ({
        ...prev,
        1: { ...prev[1], phone_number: "Please verify your mobile number before proceeding" }
      }));
      setAlert({
        show: true,
        type: "error",
        message: "Please verify your mobile number before proceeding",
      });
      return;
    }
    
    const validation = validateStep(1);
    setStepErrors(prev => ({ ...prev, [1]: validation.errors }));
    
    if (!validation.isValid) {
      setAlert({
        show: true,
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }

    // If social login was used, user_id is already set
    if (socialLoginUsed && userId) {
      // Social login already created the user, proceed to Step 2
      if (!completedSteps.includes(1)) {
        setCompletedSteps([...completedSteps, 1]);
      }
      setCurrentStep(2);
      return;
    }

    // Just validate and move to next step (API call will happen on submit)
    if (!completedSteps.includes(1)) {
      setCompletedSteps([...completedSteps, 1]);
    }
    setCurrentStep(2);
  };

  // Step 2: Validate and submit (completes registration)
  const handleStep2Complete = () => {
    const validation = validateStep(2);
    setStepErrors(prev => ({ ...prev, [2]: validation.errors }));
    
    if (!validation.isValid) {
      setAlert({
        show: true,
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }

    // Step 2 is the final step - submit registration
    handleSubmit();
  };

  const handleStepNext = () => {
    if (currentStep === 1) {
      // For Step 1, check phone verification for non-social login users
      if (!socialLoginUsed && formData.phone_number && !phoneVerified) {
        setAlert({
          show: true,
          type: "error",
          message: "Please verify your mobile number before proceeding",
        });
        // Set phone_number error
        setStepErrors(prev => ({
          ...prev,
          1: { ...prev[1], phone_number: "Please verify your mobile number" }
        }));
        return;
      }
      handleStep1Complete();
    } else if (currentStep === 2) {
      // Step 2 is the final step - submit registration
      handleStep2Complete();
    } else {
      // Fallback for any other steps
      const validation = validateStep(currentStep);
      setStepErrors(prev => ({ ...prev, [currentStep]: validation.errors }));
      
      if (validation.isValid) {
        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps([...completedSteps, currentStep]);
        }
        setCurrentStep(currentStep + 1);
      } else {
      setAlert({
        show: true,
        type: "error",
          message: "Please fill in all required fields before proceeding",
        });
      }
    }
  };

  // Submit: Make API calls in sequence (Step 1 → Step 2, Step 2 completes registration)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Check phone verification for non-social login users before submitting
    if (!socialLoginUsed && formData.phone_number && !phoneVerified) {
      setCurrentStep(1);
      setStepErrors(prev => ({
        ...prev,
        1: { ...prev[1], phone_number: "Please verify your mobile number before submitting" }
      }));
      setAlert({
        show: true,
        type: "error",
        message: "Please verify your mobile number before submitting",
      });
      return;
    }
    
    // Validate all steps before submitting
    const step1Validation = validateStep(1);
    const step2Validation = validateStep(2);
    
    setStepErrors({
      1: step1Validation.errors,
      2: step2Validation.errors,
    });
    
    if (!step1Validation.isValid || !step2Validation.isValid) {
      setAlert({
        show: true,
        type: "error",
        message: "Please complete all steps before submitting",
      });
      // Navigate to first step with errors
      if (!step1Validation.isValid) {
        setCurrentStep(1);
      } else if (!step2Validation.isValid) {
        setCurrentStep(2);
      }
      return;
    }

    setLoading(true);
    setAlert({ show: false, type: 'error', message: '' });

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://restaurantreviews.io';
    
    // Get user_id from sessionStorage (social auth) or state (email/password)
    let currentUserId = userId;
    const storedUserId = sessionStorage.getItem('registration_user_id');
    if (storedUserId && !currentUserId) {
      currentUserId = parseInt(storedUserId, 10);
      setUserId(currentUserId);
    }

    try {
      // STEP 1: Create user account
      // IMPORTANT: For email/password users, ALWAYS call Step 1 API to validate email/username uniqueness
      // Only skip Step 1 for social auth users (user already created via social login)
      
      if (!socialLoginUsed) {
        // Email/password registration: ALWAYS call Step 1 API
        console.log('Step 1: Creating user account...');
        
        // Clear any stale user_id from previous registration attempts
        // This ensures we always validate the current email/username
        sessionStorage.removeItem('registration_user_id');
        setUserId(null);
        currentUserId = null;
        
        const step1Data = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          user_type: "OWNER",
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
        };

        const step1Response = await fetch(`${apiBaseUrl}/api/auth/register-step1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(step1Data),
        });

        const step1ResponseText = await step1Response.text();
        console.log('Step 1: Raw server response:', step1ResponseText);
      
        let step1ResponseData: any;
        try {
          step1ResponseData = JSON.parse(step1ResponseText);
        } catch (e) {
          console.error('Error parsing Step 1 response:', e);
          throw new Error('Invalid server response from Step 1');
        }

        if (!step1Response.ok) {
          if (step1Response.status === 400) {
            // Parse field-specific errors
            const fieldErrors: { [field: string]: string } = {};
            let generalErrorMessage = '';
            
            // Handle different error response formats
            if (step1ResponseData.error) {
              if (typeof step1ResponseData.error === 'object') {
                // Extract field-specific errors
                Object.entries(step1ResponseData.error).forEach(([field, msgs]) => {
                  const message = Array.isArray(msgs) ? msgs[0] : String(msgs);
                  // Map backend field names to form field names
                  if (field === 'username' || field === 'email') {
                    fieldErrors[field] = message;
                  } else {
                    // For other fields, add to general error
                    generalErrorMessage += `${field}: ${message}. `;
                  }
                });
              } else {
                generalErrorMessage = String(step1ResponseData.error);
              }
            } else if (step1ResponseData.errors) {
              Object.entries(step1ResponseData.errors).forEach(([field, msgs]) => {
                const message = Array.isArray(msgs) ? msgs[0] : String(msgs);
                if (field === 'username' || field === 'email') {
                  fieldErrors[field] = message;
                } else {
                  generalErrorMessage += `${field}: ${message}. `;
                }
              });
            } else if (step1ResponseData.email) {
              // Direct field error format: { "email": ["User with this email already exists."] }
              const emailError = Array.isArray(step1ResponseData.email) 
                ? step1ResponseData.email[0] 
                : String(step1ResponseData.email);
              fieldErrors.email = emailError;
            } else if (step1ResponseData.username) {
              // Direct field error format: { "username": ["A user with that username already exists."] }
              const usernameError = Array.isArray(step1ResponseData.username) 
                ? step1ResponseData.username[0] 
                : String(step1ResponseData.username);
              fieldErrors.username = usernameError;
            }
            
            // Set field-specific errors in stepErrors
            if (Object.keys(fieldErrors).length > 0) {
              setStepErrors(prev => ({
                ...prev,
                1: { ...prev[1], ...fieldErrors }
              }));
            }
            
            // Handle duplicate email error specifically
            if (fieldErrors.email && (
              fieldErrors.email.toLowerCase().includes('already exists') ||
              fieldErrors.email.toLowerCase().includes('already registered')
            )) {
              setCurrentStep(1);
              setAlert({
                show: true,
                type: 'error',
                message: 'This email is already registered. Please use a different email or login with your existing account.',
              });
              setLoading(false);
              return; // Exit early - don't proceed to Step 2
            }
            
            // Handle duplicate username error specifically
            if (fieldErrors.username && (
              fieldErrors.username.toLowerCase().includes('already exists') ||
              fieldErrors.username.toLowerCase().includes('already taken')
            )) {
              setCurrentStep(1);
              setAlert({
                show: true,
                type: 'error',
                message: 'This username is already taken. Please choose a different username.',
              });
              setLoading(false);
              return; // Exit early - don't proceed to Step 2
            }
            
            // If there are field-specific errors, navigate to Step 1 and show errors
            if (Object.keys(fieldErrors).length > 0) {
              setCurrentStep(1);
              setAlert({
                show: true,
                type: 'error',
                message: 'Please fix the errors below and try again.',
              });
              setLoading(false);
              return; // Exit early - don't proceed to Step 2
            }
            
            // If no field-specific errors but there's a general error message
            if (generalErrorMessage) {
              throw new Error(generalErrorMessage.trim() || 'Step 1: Validation failed');
            }
          }
          throw new Error(`Step 1 failed. Status: ${step1Response.status}`);
        }

        if (!step1ResponseData.user_id) {
          throw new Error('User ID not received from Step 1');
        }

        // Step 1 succeeded - store user_id
        currentUserId = step1ResponseData.user_id;
        setUserId(currentUserId);
        // Store userId in sessionStorage to persist across page refreshes
        sessionStorage.setItem('registration_user_id', String(currentUserId));
        console.log('Step 1: User created successfully, user_id:', currentUserId);
      } else {
        // Social auth: User was already created via social login
        // Use stored user_id from sessionStorage (set during social login callback)
        const hasStoredUserId = sessionStorage.getItem('registration_user_id');
        if (!currentUserId && hasStoredUserId) {
          currentUserId = parseInt(hasStoredUserId, 10);
          setUserId(currentUserId);
          console.log('Step 1: Skipped (social login), using stored user_id:', currentUserId);
        } else if (currentUserId) {
          console.log('Step 1: Skipped (social login), user_id:', currentUserId);
        } else {
          throw new Error('User ID is missing. Please complete Step 1 or use social login.');
        }
      }

      // Ensure currentUserId is available before proceeding to Step 2
      if (!currentUserId) {
        throw new Error('User ID is missing. Please go back to Step 1 and complete your registration.');
      }

      // STEP 2: Select existing restaurant or create new restaurant
      console.log('Step 2: Processing restaurant...');
      console.log('Step 2: Using user_id:', currentUserId);
      
      // Validate ownership proof file
      if (!formData.ownership_proof) {
        setCurrentStep(2);
        setAlert({
          show: true,
          type: 'error',
          message: 'Please upload ownership proof document (ASIC extract)',
        });
        setStepErrors(prev => ({
          ...prev,
          2: { ...prev[2], ownership_proof: 'Ownership Proof (ASIC extract) is required' }
        }));
        return;
      }

      // Validate file size (max 10MB)
      if (formData.ownership_proof.size > 10 * 1024 * 1024) {
        setCurrentStep(2);
        setAlert({
          show: true,
          type: 'error',
          message: 'File size must be less than 10MB',
        });
        setStepErrors(prev => ({
          ...prev,
          2: { ...prev[2], ownership_proof: 'File size must be less than 10MB' }
        }));
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(formData.ownership_proof.type)) {
        setCurrentStep(2);
        setAlert({
          show: true,
          type: 'error',
          message: 'Please upload PDF or image file (PDF, JPG, PNG)',
        });
        setStepErrors(prev => ({
          ...prev,
          2: { ...prev[2], ownership_proof: 'Please upload PDF or image file' }
        }));
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Ensure user_id is valid before appending
      if (!currentUserId || isNaN(currentUserId)) {
        throw new Error('Invalid user ID. Please go back to Step 1 and complete your registration.');
      }
      
      formDataToSend.append('user_id', String(currentUserId));
      console.log('Step 2: FormData prepared with user_id:', currentUserId);
      
      if (formData.restaurant_id) {
        // Option A: Select existing restaurant
        formDataToSend.append('action', 'select');
        formDataToSend.append('restaurant_id', String(formData.restaurant_id));
        console.log('Step 2: Selecting existing restaurant_id:', formData.restaurant_id);
      } else if (formData.restaurant_name) {
        // Option B: Create new restaurant
        const streetAddress = [
          formData.restaurant_street_number,
          formData.restaurant_street_name
        ].filter(Boolean).join(' ').trim();

        formDataToSend.append('action', 'create');
        formDataToSend.append('name', formData.restaurant_name);
        formDataToSend.append('street_address', streetAddress || formData.restaurant_street_name);
        formDataToSend.append('city', formData.restaurant_suburb);
        formDataToSend.append('country', formData.restaurant_country);
        
        console.log('Step 2: Creating new restaurant:', {
          name: formData.restaurant_name,
          street_address: streetAddress || formData.restaurant_street_name,
          city: formData.restaurant_suburb,
          country: formData.restaurant_country,
        });
        
        // Add optional fields only if they have values
        if (formData.restaurant_state) {
          formDataToSend.append('state', formData.restaurant_state);
        }
        if (formData.restaurant_postcode) {
          formDataToSend.append('postal_code', formData.restaurant_postcode);
        }
        if (formData.restaurant_phone) {
          formDataToSend.append('primary_phone', formData.restaurant_phone);
        }
        if (formData.restaurant_email) {
          formDataToSend.append('primary_email', formData.restaurant_email);
        }
        if (formData.restaurant_latitude) {
          formDataToSend.append('latitude', String(formData.restaurant_latitude));
        }
        if (formData.restaurant_longitude) {
          formDataToSend.append('longitude', String(formData.restaurant_longitude));
        }
      } else {
        throw new Error('No restaurant selected or created');
      }

      // Add ownership proof file
      if (formData.ownership_proof) {
        formDataToSend.append('ownership_proof', formData.ownership_proof);
        console.log('Step 2: Ownership proof file:', formData.ownership_proof.name, formData.ownership_proof.size, 'bytes');
      } else {
        throw new Error('Ownership proof file is required');
      }
      
      // Log all FormData keys for debugging
      console.log('Step 2: FormData keys being sent:', Array.from(formDataToSend.keys()));

      const step2Response = await fetch(`${apiBaseUrl}/api/auth/register-step2/`, {
        method: 'POST',
        // DO NOT set Content-Type header - browser will set it automatically with boundary
        body: formDataToSend,
      });

      const step2ResponseText = await step2Response.text();
      console.log('Step 2: Raw server response:', step2ResponseText);

      let step2DataResult;
      try {
        step2DataResult = JSON.parse(step2ResponseText);
      } catch (e) {
        console.error('Error parsing Step 2 response:', e);
        // Check if response is HTML (Django error page)
        if (step2ResponseText.trim().startsWith('<!DOCTYPE') || step2ResponseText.includes('<html')) {
          // Try to extract error message from HTML
          const errorMatch = step2ResponseText.match(/<pre class="exception_value">([\s\S]*?)<\/pre>/);
          let errorMessage = errorMatch ? errorMatch[1].replace(/&#x27;/g, "'").trim() : 'Server error occurred';
          
          // Parse Django ValidationError format: {'restaurant': ['message']}
          const validationErrorMatch = errorMessage.match(/\{'restaurant':\s*\[(.*?)\]\}/);
          if (validationErrorMatch) {
            const validationMsg = validationErrorMatch[1].replace(/['"]/g, '').trim();
            errorMessage = validationMsg;
          }
          
          if (step2Response.status === 500) {
            throw new Error(`Server error: ${errorMessage}. Please try again or contact support if the issue persists.`);
          }
          throw new Error(`Server error (${step2Response.status}): ${errorMessage}`);
        }
        throw new Error('Invalid server response from Step 2. Please try again.');
      }

      if (!step2Response.ok) {
        if (step2Response.status === 400) {
          let errorMessage = '';
          if (step2DataResult.error) {
            if (typeof step2DataResult.error === 'object') {
              const errors = Object.entries(step2DataResult.error)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
                .join(', ');
              errorMessage = errors;
            } else {
              errorMessage = step2DataResult.error;
            }
          } else if (step2DataResult.errors) {
            const errors = Object.entries(step2DataResult.errors)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
              .join(', ');
            errorMessage = errors;
          }
          
          const errorLower = errorMessage.toLowerCase();
          if (errorLower.includes('user not found') || errorLower.includes('user does not exist')) {
            // Clear sessionStorage, reset userId state, and redirect to Step 1
            sessionStorage.removeItem('registration_user_id');
            setUserId(null);
            setCurrentStep(1);
            setLoading(false);
            setAlert({
              show: true,
              type: 'error',
              message: 'User account not found. Please complete Step 1 again to create a new account.',
            });
            return; // Exit early, don't throw error
          } else if (errorLower.includes('already has an owner') || 
              errorLower.includes('restaurant already owned') ||
              errorLower.includes('owner exists') ||
              errorLower.includes('cannot be claimed')) {
            // Check if this is for a new restaurant (action='create')
            const isCreatingNew = formDataToSend.get('action') === 'create';
            if (isCreatingNew) {
              throw new Error('Backend error: New restaurant was created but validation failed. This is a backend issue - the restaurant should be created without an owner initially, then a claim request should be created. Please contact support.');
            } else {
              throw new Error('The selected restaurant already has an owner. Please select a different restaurant or add a new one.');
            }
          }
          
          throw new Error(errorMessage || 'Step 2: Restaurant processing failed');
        } else if (step2Response.status === 500) {
          // Server error - provide helpful message
          const serverError = step2DataResult?.error || step2DataResult?.message || 'Internal server error';
          throw new Error(`Server error occurred while processing your restaurant registration. Please try again. If the problem persists, contact support. Error: ${serverError}`);
        }
        throw new Error(`Step 2 failed. Status: ${step2Response.status}. Please try again.`);
      }

      console.log('Step 2: Success:', step2DataResult);

      // Step 2 now completes registration - Free plan is automatically assigned
      // Handle completion based on response
      
      // Store subscription data if provided
      if (step2DataResult.subscription) {
        localStorage.setItem('user_subscription', JSON.stringify(step2DataResult.subscription));
        console.log('Subscription stored:', step2DataResult.subscription);
      }
      
      // Check if registration is complete (social auth users)
      if (step2DataResult.registration_complete) {
        // Social auth: Store tokens and redirect to dashboard
        if (step2DataResult.access && step2DataResult.refresh) {
          localStorage.setItem('access_token', step2DataResult.access);
          localStorage.setItem('refresh_token', step2DataResult.refresh);
          if (step2DataResult.user) {
            localStorage.setItem('user', JSON.stringify(step2DataResult.user));
          }
          
          // Dispatch event to notify other components
          window.dispatchEvent(new Event('authStateChange'));
          
          // Clear registration session
          sessionStorage.removeItem('registration_user_id');
          sessionStorage.removeItem('is_social_auth');
          
          console.log('Social auth: Registration completed, tokens stored, redirecting to dashboard');
          
          // Redirect to dashboard
          router.push('/dashboard' as any);
          return;
        }
      }
      
      // Email/password users: Show email verification message
      if (step2DataResult.requires_email_verification || step2DataResult.email_verification_sent) {
        // Mark all steps as completed
        setCompletedSteps([1, 2]);
        
        // Set registration success to show success message
        setRegistrationSuccess(true);
        
        // Show success message
      setAlert({
        show: true,
          type: 'success',
          message: step2DataResult.message || 'Registration completed! Please check your email to verify your account.',
        });
        
        console.log('Email verification required. User should check email.');
        return;
      }
      
      // Fallback: Mark steps as completed
      setCompletedSteps([1, 2]);
      setRegistrationSuccess(true);

    } catch (error) {
      console.error('Registration error:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to complete registration',
      });
    } finally {
      setLoading(false);
    }
  };

  // If user type not selected, show selection screen
  if (!selectedUserType) {
    return (
      <div className="nc-PageSignUp">
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
              <Link href={"/login" as any} className="font-semibold underline">
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
      <div className="nc-PageSignUp">
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

                <ButtonPrimary type="submit" disabled={loading}>
                  {loading ? "Signing up..." : "Sign Up"}
                </ButtonPrimary>
              </form>

          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            Already have an account? {` `}
              <Link href={"/login" as any} className="font-semibold underline">
              Sign in
            </Link>
          </span>
        </div>
        </div>
      </div>
    );
  }

  // Show success message if registration is complete
  if (registrationSuccess) {
    return (
      <div className="nc-PageSignUp">
        <div className="container mb-24 lg:mb-32">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 border border-neutral-200 dark:border-neutral-700">
              <div className="text-center space-y-6">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {/* Success Title */}
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    Registration Successful!
                  </h2>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400">
                    Thank you for registering with us
                  </p>
                </div>

                {/* Verification Message */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-left space-y-2">
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                        Account Verification Required
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Your account has been successfully created, but it requires verification before you can access all features.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 dark:border-blue-700 pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Our admin team will contact you via <strong>phone or email</strong> to complete the verification process.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        This process typically takes up to <strong>48 hours</strong>. Please check your email and phone for any communication from our team.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-sm text-neutral-500 dark:text-neutral-400 space-y-2">
                  <p>
                    If you have any questions or concerns, please don't hesitate to contact our support team.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link
                    href={"/" as any}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors text-center"
                  >
                    Go to Homepage
                  </Link>
                  <Link
                    href={"/login" as any}
                    className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg font-medium transition-colors text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Restaurant Owner multi-step form
  return (
    <div className="nc-PageSignUp">
      <Alert 
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert(prev => ({ ...prev, show: false }))}
      />
      <div className="container mb-24 lg:mb-32">
        <div className="text-center my-12 sm:my-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            Restaurant Owner Registration
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
            Join our platform and grow your restaurant business
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-8 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              const hasErrors = checkStepHasErrors(step.id) && Object.keys(stepErrors[step.id] || {}).length > 0;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      className="group flex flex-col items-center flex-1 transition-all cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all border-2 ${
                          hasErrors && !isCurrent
                            ? "bg-red-100 border-red-600 text-red-700"
                            : isCurrent
                            ? hasErrors
                              ? "bg-red-100 border-red-600 text-red-700 ring-4 ring-red-200 dark:ring-red-900 scale-110"
                              : "bg-green-100 border-green-600 text-green-700 ring-4 ring-green-200 dark:ring-green-900 scale-110"
                            : isCompleted
                            ? "bg-green-100 border-green-600 text-green-700"
                            : currentStep > step.id
                            ? hasErrors
                              ? "bg-red-100 border-red-600 text-red-700"
                              : "bg-green-100 border-green-600 text-green-700"
                            : "bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400"
                        } ${
                          !isCurrent
                            ? "hover:scale-105 hover:ring-2 hover:ring-green-300 dark:hover:ring-green-700"
                            : ""
                        }`}
                      >
                        {isCompleted && !isCurrent && !hasErrors ? (
                          <svg className={`w-6 h-6 ${hasErrors ? "text-red-700" : "text-green-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className={
                            hasErrors && !isCurrent
                              ? "text-red-700"
                              : isCurrent
                              ? hasErrors
                                ? "text-red-700"
                                : "text-green-700"
                              : isCompleted || currentStep > step.id
                              ? hasErrors
                                ? "text-red-700"
                                : "text-green-700"
                              : "text-neutral-500 dark:text-neutral-400"
                          }>{step.id}</span>
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium text-center transition-colors ${
                          hasErrors && !isCurrent
                            ? "text-red-700 font-semibold"
                            : isCurrent
                            ? hasErrors
                              ? "text-red-700 font-semibold"
                              : "text-green-700 font-semibold"
                            : isCompleted || currentStep > step.id
                            ? hasErrors
                              ? "text-red-700"
                              : "text-green-700"
                            : "text-neutral-500 dark:text-neutral-400"
                        } ${
                          !isCurrent
                            ? "group-hover:text-green-700 dark:group-hover:text-green-600"
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
                        hasErrors && currentStep > step.id
                          ? "bg-red-600"
                          : currentStep > step.id || completedSteps.includes(step.id + 1)
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
        <div className="mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 border border-neutral-200 dark:border-neutral-700">
            {currentStep === 1 && (
              <Step1UserDetails
                formData={formData}
                handleChange={handleChange}
                handleSocialLogin={handleSocialLogin}
                socialLoginUsed={socialLoginUsed}
                loginSocials={loginSocials}
                loading={loading}
                errors={stepErrors[1] || {}}
                onPhoneVerified={(verified) => {
                  setPhoneVerified(verified);
                  // Clear phone_number error when verified
                  if (verified && stepErrors[1]?.phone_number) {
                    setStepErrors(prev => {
                      const newErrors = { ...prev };
                      if (newErrors[1]) {
                        const stepErrorsCopy = { ...newErrors[1] };
                        delete stepErrorsCopy.phone_number;
                        newErrors[1] = stepErrorsCopy;
                      }
                      return newErrors;
                    });
                  }
                }}
              />
            )}
            
            {currentStep === 2 && (
              <Step2RestaurantSelection
                formData={formData}
                handleChange={handleChange}
                handleFileChange={handleFileChange}
                setFormData={setFormData}
                errors={stepErrors[2] || {}}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <ButtonSecondary
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className="px-6 py-2.5"
              >
                Previous
              </ButtonSecondary>
              <ButtonPrimary
                onClick={handleStepNext}
                disabled={
                  loading || 
                  (currentStep === 1 && !socialLoginUsed && !!formData.phone_number && !phoneVerified)
                }
                className="px-8 py-2.5"
              >
                {currentStep === steps.length ? (loading ? "Signing up..." : "Sign Up") : "Next"}
              </ButtonPrimary>
            </div>
          </div>
        </div>

        <span className="block text-center text-neutral-700 dark:text-neutral-300 mt-8">
          Already have an account? {` `}
          <Link href={"/login" as any} className="font-semibold underline">
            Sign in
          </Link>
        </span>
      </div>
    </div>
  );
};

export default PageSignUp;
