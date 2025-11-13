import React, { useState } from 'react';
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
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const active = focused || value.length > 0;

  return (
    <div
      className={`relative rounded-2xl border px-4 py-3 flex flex-col gap-1 transition-colors ${
        active ? 'border-primary' : 'border-foreground'
      }`}
    >
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          {icon}
        </div>
      )}

      <label
        htmlFor={id}
        className={`block text-lg font-medium leading-none ${icon ? 'pl-8' : ''} transition-colors ${
          active ? 'text-primary' : 'text-foreground'
        }`}
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        aria-label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`block w-full bg-transparent border-0 p-0 text-base font-medium placeholder:text-base placeholder:font-medium placeholder:text-muted-foreground outline-none ${
          icon ? 'pl-8' : ''
        } ${className}`}
      />
    </div>
  );
}
