import { cn } from '@/lib/utils';

type ShowPoweredByProps = {
  show: boolean;
  position?: 'sticky' | 'absolute' | 'static';
};
const ShowPoweredBy = ({ show, position = 'sticky' }: ShowPoweredByProps) => {
  if (!show) {
    return null;
  }
  return (
    <div
      data-powered-by-branding="true"
      className={cn('bottom-0 right-3 pointer-events-none z-40', position, {
        '-mt-[30px]': position === 'sticky',
        'mr-5': position === 'sticky',
      })}
    >
      <div
        className={cn(
          'justify-end text-gray-11 text-sm items-center flex gap-1 transition group ',
          {
            'justify-center': position === 'static',
          },
        )}
      >
        <div className=" text-sm transition">Built with</div>
        <div className="justify-center flex items-center gap-1">
          <svg
            width={15}
            height={15}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="transition fill-gray-11/70"
          >
            <path d="M3 19 L9 5 L13 12 L16 8.5 L21 19 Z" />
          </svg>
          <div className="font-semibold">Fuji</div>
        </div>
      </div>
    </div>
  );
};

ShowPoweredBy.displayName = 'ShowPoweredBy';
export { ShowPoweredBy };
