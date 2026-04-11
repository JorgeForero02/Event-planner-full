import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'border-transparent bg-brand-600 text-white',
        secondary:   'border-transparent bg-slate-100 text-slate-800',
        outline:     'text-slate-700 border-slate-300',
        destructive: 'border-transparent bg-rose-100 text-rose-800 border-rose-200',
        success:     'border-transparent bg-emerald-100 text-emerald-800 border-emerald-200',
        warning:     'border-transparent bg-amber-100 text-amber-800 border-amber-200',
        info:        'border-transparent bg-sky-100 text-sky-800 border-sky-200',
        draft:     'border-transparent bg-slate-100 text-slate-600',
        published: 'border-transparent bg-brand-100 text-brand-700 border-brand-200',
        cancelled: 'border-transparent bg-rose-100 text-rose-700 border-rose-200',
        finished:  'border-transparent bg-emerald-100 text-emerald-700 border-emerald-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
