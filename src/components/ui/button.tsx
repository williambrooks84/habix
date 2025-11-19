"use client";

import clsx from 'clsx';
import { ButtonProps } from '@/types/ui';

export function Button({ children, className, style, ...rest }: ButtonProps) {
  const cn = (...args: any[]) => clsx(...args);

  const variants: Record<string, string> = {
    primary: 'bg-primary text-foreground hover:opacity-95',
    transparent: 'bg-transparent hover:opacity-95',
  };

  const sizes: Record<string, string> = {
    normal: 'h-12 px-4 text-xl font-semibold',
    small: 'h-8 px-8 py-3 justify-center items-center gap-1 text-sm',
    paddingless: 'p-0',
  };

  const base =
    'flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-primary aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

  // pull variant/size out so they are not forwarded to the DOM element
  const { variant = 'primary', size = 'normal', ...buttonProps } = rest as any;

  // Build final className deterministically so server and client match
  const finalClassName = cn(base, variants[variant] ?? variants.primary, sizes[size] ?? sizes.normal, className);

  // Avoid forwarding undefined style (keeps server/client parity)
  const forwardedStyle = style ?? undefined;

  return (
    <button
      {...(buttonProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      {...(forwardedStyle ? { style: forwardedStyle } : {})}
      className={finalClassName}
    >
      {children}
    </button>
  );
}
