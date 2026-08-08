'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string; // enforced: icon-only buttons must be labeled
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md',
          'text-muted-foreground transition-all duration-150',
          'hover:bg-muted hover:text-foreground active:scale-95 motion-reduce:transform-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);

IconButton.displayName = 'IconButton';