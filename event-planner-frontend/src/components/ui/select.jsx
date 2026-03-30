import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Native <select> styled to match shadcn/ui's design system.
 * For complex popper selects use @radix-ui/react-select directly.
 */
const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-9 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:border-brand-500',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export { Select };
