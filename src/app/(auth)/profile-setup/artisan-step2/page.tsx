'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useOnboarding } from '@/components/artisan/onboarding-context';
import type { ArtisanFormData } from '@/components/artisan/onboarding-context';
import { ArtisanProfileStep2 } from '@/components/artisan/artisan-profile-step2';
import { OnboardingStepHeader } from '@/components/artisan/onboarding-step-header';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { useSaveProfile } from '@/lib/hooks';

export default function ArtisanStep2() {
  const router = useRouter();
  const {
    accountType,
    artisanData,
    setArtisanData,
    completeOnboarding,
    completed,
    isHydrated,
  } = useOnboarding();
  const { mutate: saveProfile } = useSaveProfile();
  const { isPending: isLoading, submit } = useFormSubmission({
    errorMessage: (error) =>
      error instanceof Error ? error.message : 'Failed to save profile data.',
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (completed) {
      router.replace('/profile-setup/success');
    } else if (accountType !== 'artisan') {
      router.replace('/profile-setup/account-type');
    }
  }, [accountType, completed, isHydrated, router]);

  if (!isHydrated || accountType !== 'artisan') {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-[#6366F1]">Loading...</div>
      </div>
    );
  }

  const handleComplete = async (data: Partial<ArtisanFormData>) => {
    if (isLoading) return;

    const updatedArtisanData = { ...artisanData, ...data };
    setArtisanData(updatedArtisanData);

    await submit(async () => {
      await saveProfile(updatedArtisanData);

      completeOnboarding();
      router.push('/profile-setup/success');
    });
  };

  return (
    <div className="w-full max-w-[520px]">
      <OnboardingStepHeader
        currentStep={2}
        onBack={() => router.push('/profile-setup/artisan-step1')}
      />
      <ArtisanProfileStep2 data={artisanData} onComplete={handleComplete} />
    </div>
  );
}
