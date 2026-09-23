'use client';

import { useState } from 'react';
import Image from "next/image";
import { useSaveProfile } from '@/lib/hooks';



interface FormData {
  fullName: string;
  email: string;
  state: string;
  city: string;
  referralSource: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;


const USStates = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado',
  'Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho',
  'Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana',
  'Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
  'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma',
  'Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington',
  'West Virginia','Wisconsin','Wyoming',
];

const ReferralSources = [
  'Social Media',
  'Word of Mouth',
  'Search Engine',
  'Advertisement',
  'Friend Referral',
  'Event or Workshop',
  'Other',
];

const initialFormState: FormData = {
  fullName: 'John Doe',
  email: 'you@example.com',
  state: '',
  city: '',
  referralSource: '',
};


const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validators: Record<keyof FormData, (value: string) => string | null> = {
  fullName: (v) => (!v.trim() ? 'Full name is required' : null),
  email: (v) =>
    !v.trim()
      ? 'Email address is required'
      : !validateEmail(v)
      ? 'Please enter a valid email address'
      : null,
  state: (v) => (!v ? 'Please select a state' : null),
  city: (v) => (!v.trim() ? 'City is required' : null),
  referralSource: (v) =>
    (!v ? 'Please select how you heard about us' : null),
};


export default function AccountCompletionPage() {
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const { mutate: saveProfile, isPending: isLoading } = useSaveProfile();

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    (Object.keys(formData) as (keyof FormData)[]).forEach((key) => {
      const error = validators[key](formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = await saveProfile(formData);
      console.log('Form submitted successfully:', data);
      setSubmitSuccess(true);

      setTimeout(() => {
        setFormData(initialFormState);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred while submitting the form. Please try again.';
      
      setErrors((prev) => ({
        ...prev,
        email: errorMessage,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        
        <div className="flex items-center justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-md">
            
            <div className="mb-8">
              <Image
                    className='w-30 lg:w-36 mb-16'
                    src="/Artisyn.svg"
                    alt="Artisyn.io logo"
                    width={100}
                    height={100}
                    priority
                />
            </div>

            
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Complete your account
              </h2>
              <p className="text-[#6B6878] font-normal text-md mb-16 leading-relaxed">
                This helps us personalize your experience and connect you with the
                right artisans.
              </p>
            </div>

            
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">
                  Account setup completed successfully! Redirecting...
                </p>
              </div>
            )}

            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-[#020817] mb-1">
                  Full Name
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-transparent border rounded-xl text-[#64748B] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                    errors.fullName
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fullName}
                  </p>
                )}
              </div>

              
              <div>
                <label className="block text-sm font-medium text-[#020817] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-transparent border rounded-xl text-[#64748B] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                    errors.email
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#020817] mb-1">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-transparent border rounded-xl text-[#64748B] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                      errors.state
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <option value="">Choose State</option>
                    {USStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#020817] mb-1">
                    City
                  </label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-transparent border rounded-xl text-[#64748B] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                      errors.city
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-[#020817] mb-1">
                  How did you hear about us?
                </label>
                <select
                  name="referralSource"
                  value={formData.referralSource}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-transparent border rounded-xl text-[#64748B] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                    errors.referralSource
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <option value="">Choose option</option>
                  {ReferralSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                {errors.referralSource && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.referralSource}
                  </p>
                )}
              </div>

              
              <button
                type="submit"
                disabled={isLoading}
                className="w-fit mt-12 px-10 py-3 bg-[#605DEC] hover:bg-[#4441ed] disabled:bg-indigo-400 text-white font-medium rounded-xl transition duration-200 ease-in-out transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Completing...' : 'Complete Setup'}
              </button>
            </form>
          </div>
        </div>

        
        <div className="hidden lg:flex items-center justify-center bg-gray-100">
          <div className="relative w-full h-full">
            <Image
              src="/image1.jpg"
              alt="Artisan at work"
              fill
              className="object-cover"
              priority
            />
            
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
