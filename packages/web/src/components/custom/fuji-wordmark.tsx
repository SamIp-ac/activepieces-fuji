import { t } from 'i18next';

import { cn } from '@/lib/utils';

const FujiWordmark = ({ className }: { className?: string }) => (
  <svg
    className={cn('h-full w-auto text-gray-11', className)}
    viewBox="0 0 116 40"
    fill="none"
    role="img"
    aria-label={t('logo')}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M2 31 L12 11 L18 21 L23 14 L33 31 Z" fill="#6e41e2" />
    <text x="40" y="29.5" fontSize="26" fontWeight={700} fill="currentColor" fontFamily="inherit">
      Fuji
    </text>
  </svg>
);
FujiWordmark.displayName = 'FujiWordmark';
export { FujiWordmark };
