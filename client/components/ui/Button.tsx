import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "solid" | "outline" | "ghost";
  asChild?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'solid',
  asChild,
  size = 'md',
  children,
  className = '',
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button';

  const variantClasses: Record<string, string> = {
    solid: 'bg-blue-500 text-white hover:bg-blue-600',
    ghost: 'bg-transparent text-blue-500 hover:bg-blue-50',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-md',
  };

  return (
    <Comp
      ref={ref}
      className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
});

Button.displayName = 'Button';
