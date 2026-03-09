import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  isLoading = false,
  disabled,
  ...rest
}: ButtonProps) {
  const baseClasses = 'rounded-xl py-4 px-6 items-center justify-center flex-row';

  const variantClasses = {
    primary: 'bg-primary-600 active:bg-primary-700',
    secondary: 'bg-primary-100 active:bg-primary-200',
    ghost: 'bg-transparent',
  }[variant];

  const textClasses = {
    primary: 'text-white font-semibold text-base',
    secondary: 'text-primary-700 font-semibold text-base',
    ghost: 'text-primary-600 font-semibold text-base',
  }[variant];

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses} ${disabled || isLoading ? 'opacity-50' : ''}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : '#4f46e5'}
          size="small"
          className="mr-2"
        />
      ) : null}
      <Text className={textClasses}>{label}</Text>
    </TouchableOpacity>
  );
}
