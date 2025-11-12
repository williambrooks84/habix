import React from 'react';
import type { FormInputProps } from '@/types/ui';

export default function FormInput({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  minLength,
  icon,
  className = '',
}: FormInputProps) {
  return (
    <div className="mb-2">
      <div className="relative">
        {/* Icon (optional) */}
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </div>
        )}

        {/* Floating/inline label positioned inside the input */}
        <label htmlFor={id} className="absolute left-14 -top-2 text-xs font-medium text-muted-foreground pointer-events-none">
          {label}
        </label>

        <input
          className={`peer block w-full rounded-[20px] border border-border bg-transparent py-[18px] pl-14 pr-4 text-sm text-foreground outline-2 placeholder:text-muted ${className}`}
          id={id}
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          aria-label={label}
        />
      </div>
    </div>
  );
}
