import React from 'react';

type FormInputProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  icon?: React.ReactNode;
};

export default function FormInput({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  minLength,
  icon,
}: FormInputProps) {
  return (
    <div>
      <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
          id={id}
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
        />
        {icon}
      </div>
    </div>
  );
}
