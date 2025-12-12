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
  value,
  onChange,
  onBlur,
  error = null,
  className = '',
}: FormInputProps & {
  value?: string;
  onChange?: (v: string) => void;
  onBlur?: () => void;
  error?: string | null;
}) {
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState('');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value! : localValue;

  const active = focused;
  const hasError = Boolean(error);
  const showError = hasError && currentValue.length > 0;

  return (
    <div
      className={`relative rounded-2xl border px-4 py-3 flex flex-col gap-1 transition-colors ${
        showError ? 'border-destructive' : active ? 'border-primary' : 'border-foreground'
      } ${className}`}
    >
      {icon && (
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${showError ? 'text-destructive' : 'text-muted'}`}
        >
          {icon}
        </div>
      )}

      <label
        htmlFor={id}
        className={`block text-base font-semibold leading-none ${icon ? 'pl-8' : ''} transition-colors ${
          showError ? 'text-destructive' : active ? 'text-primary' : 'text-foreground'
        }`}
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoCapitalize={type === 'email' ? 'off' : undefined}
        value={currentValue}
        onChange={(e) => {
          const v = e.target.value;
          if (isControlled) {
            onChange?.(v);
          } else {
            setLocalValue(v);
            onChange?.(v);
          }
        }}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        aria-label={label}
        className={`block w-full bg-transparent border-0 p-0 text-base font-medium placeholder:text-base placeholder:font-medium placeholder:text-muted-foreground outline-none ${
          icon ? 'pl-8' : ''
        }`}
      />
      {showError && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
