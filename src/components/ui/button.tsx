import clsx from 'clsx';
import { ButtonProps } from '@/types/ui';

export function Button({ children, className, style, ...rest }: ButtonProps) {
  const mergedStyle = { backgroundColor: 'var(--shadcn-primary)', color: 'var(--shadcn-primary-foreground)', ...(style || {}) } as React.CSSProperties;

  return (
    <button
      {...rest}
      style={mergedStyle}
      className={clsx(
        'flex h-12 w-full items-center justify-center rounded-full px-6 text-base font-medium transition-colors hover:opacity-95 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-primary active:opacity-95 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}
