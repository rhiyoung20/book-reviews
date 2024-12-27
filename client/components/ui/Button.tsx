import React from 'react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'solid' | 'outline';
  }
>(({ className, variant = 'solid', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={className}
      {...props}
    />
  );
});

Button.displayName = 'Button';
