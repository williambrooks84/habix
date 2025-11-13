import clsx from 'clsx';
import { ButtonProps } from '@/types/ui';

export function Button({ children, className, style, ...rest }: ButtonProps) {
  const cn = (...args: any[]) => clsx(...args);

  const variants: Record<string, string> = {
    primary: 'bg-primary text-button-text hover:opacity-95',
  };

  const sizes: Record<string, string> = {
    normal: 'h-12 px-4 text-xl font-semibold',
  };

  const base =
    'flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-primary aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

  // pull variant/size out so they are not forwarded to the DOM element
  const { variant = 'primary', size = 'md', ...buttonProps } = rest as any;

  return (
    <button
      {...(buttonProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      style={style}
      className={cn(base, variants[variant] ?? variants.primary, sizes[size] ?? sizes.md, className)}
    >
      {children}
    </button>
  );
}
