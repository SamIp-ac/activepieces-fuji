import React from 'react';

import { FeatureKey, FeatureTier } from '@/features/billing';

import { FeatureTeaser } from './feature-teaser';

export const LockedFeatureGuard = ({
  children,
  locked,
  lockTitle,
  lockDescription,
  lockVideoUrl,
  lockBullets,
  lockTier,
  featureKey,
}: LockedFeatureGuardProps) => {
  if (!locked) {
    return children;
  }

  return (
    <FeatureTeaser
      title={lockTitle}
      description={lockDescription}
      bullets={lockBullets}
      tier={lockTier}
      videoUrl={lockVideoUrl}
      featureKey={featureKey}
    />
  );
};

export default LockedFeatureGuard;

type LockedFeatureGuardProps = {
  children: React.ReactNode;
  featureKey: FeatureKey;
  locked: boolean;
  lockTitle: string;
  lockDescription: string;
  lockVideoUrl?: string;
  lockBullets?: string[];
  lockTier?: FeatureTier;
};
