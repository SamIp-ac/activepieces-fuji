import {
  ApEdition,
  ApFlagId,
  PlatformAdminSurface,
} from '@activepieces/shared';
import { t } from 'i18next';
import { Lock } from 'lucide-react';
import { createContext, ReactNode, useContext } from 'react';

import { Button } from '@/components/ui/button';
import {
  FeatureKey,
  FeatureTier,
  TIER_LABELS,
  useUpgradeClick,
} from '@/features/billing';
import { flagsHooks } from '@/hooks/flags-hooks';

export function FeatureSample({
  locked,
  title,
  description,
  tier,
  featureKey,
  children,
}: FeatureSampleProps) {
  const upgradeClick = useUpgradeClick();
  const { data: edition } = flagsHooks.useFlag<ApEdition>(ApFlagId.EDITION);

  if (!locked) {
    return children;
  }

  const isCommunity = edition === ApEdition.COMMUNITY;

  return (
    <div className="relative flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden">
      <div
        inert
        aria-hidden
        className="flex flex-1 min-h-0 min-w-0 flex-col pointer-events-none select-none opacity-25"
      >
        <InsideFeatureSampleContext.Provider value={true}>
          {children}
        </InsideFeatureSampleContext.Provider>
      </div>

      <div className="absolute inset-0 grid place-items-center overflow-auto p-6">
        <div className="pointer-events-auto flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border bg-gray-1 px-8 py-9 text-center shadow-xl">
          <div className="grid size-12 place-items-center rounded-xl bg-accent-3">
            <Lock className="size-5.5 text-accent-11" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{t(title)}</h2>
            {description !== undefined && description !== '' && (
              <p className="text-sm leading-relaxed text-gray-11">
                {t(description)}
              </p>
            )}
          </div>
          {!isCommunity && (
            <Button
              className="w-full"
              onClick={() =>
                upgradeClick({
                  feature: featureKey,
                  tier,
                  surface: PlatformAdminSurface.SAMPLE,
                })
              }
            >
              {tier === undefined
                ? t('Upgrade to unlock')
                : t('Upgrade to {tier}', { tier: TIER_LABELS[tier] })}
            </Button>
          )}
          {tier !== undefined && !isCommunity && (
            <>
              <div className="h-px w-full bg-gray-6" />
              <span className="text-xs text-gray-11">
                {t('Included with the {tier} plan and above.', {
                  tier: TIER_LABELS[tier],
                })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function useInsideFeatureSample(): boolean {
  return useContext(InsideFeatureSampleContext);
}

const InsideFeatureSampleContext = createContext(false);

export type FeatureSampleProps = {
  locked: boolean;
  featureKey?: FeatureKey;
  title: string;
  description?: string;
  tier?: FeatureTier;
  children: ReactNode;
};
