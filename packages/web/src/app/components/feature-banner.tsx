import { ApEdition, ApFlagId } from '@activepieces/shared';
import { t } from 'i18next';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { billingDialogHooks } from '@/features/billing';
import { flagsHooks } from '@/hooks/flags-hooks';
import { AdminControl, adminControl } from '@/lib/admin-control';

export function FeatureBanner({ message, className }: FeatureBannerProps) {
  const { openDialog: openManagePlanDialog } =
    billingDialogHooks.useManagePlanDialogStore();
  const { data: edition } = flagsHooks.useFlag<ApEdition>(ApFlagId.EDITION);
  const isCommunity = edition === ApEdition.COMMUNITY;

  return (
    <Alert variant="primary" className={className}>
      <AlertDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>{message}</span>
        {!isCommunity && (
          <button
            {...adminControl(AdminControl.PLAN_BANNER_OPEN)}
            type="button"
            onClick={() => openManagePlanDialog()}
            className="font-medium text-accent-11 hover:underline"
          >
            {t('Upgrade plan')}
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}

export type FeatureBannerProps = {
  message: string;
  className?: string;
};
