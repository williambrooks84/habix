"use client";

import React from 'react';
import clsx from 'clsx';

type Props = {
    id?: string;
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export default function FormUI({ id, name, value, defaultValue, onChange, placeholder, className }: Props) {
    const inputId = id ?? 'habit-name-input';

    return (
        <div className={clsx('flex flex-col gap-2 items-start w-full max-w-xs', className)}>
            <label htmlFor={inputId} className="text-base font-medium leading-none">
                Nom de votre habitude
            </label>

            <input
                id={inputId}
                name={name}
                type="text"
                value={value}
                defaultValue={defaultValue}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder ?? 'Quelle est votre habitude en ce moment ?'}
                className="w-full rounded-full border-2 border-gray-200 px-4 py-3 text-sm placeholder:opacity-80 transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Nom de votre habitude"
            />
        </div>
    );
}