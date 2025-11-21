"use client";

import React from 'react';
import clsx from 'clsx';
import { FormUIProps } from '@/types/ui';
import FormLabel from './form-label';

export default function FormUI({ id, name, value, defaultValue, onChange, placeholder, className }: FormUIProps) {
    return (
        <div className={clsx('flex flex-col items-start w-full gap-3', className)}>
            <FormLabel id={id} label="Nom de votre habitude" />

            <input
                id={id}
                name={name}
                type="text"
                value={value}
                defaultValue={defaultValue}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-full border-3 border-foreground px-4 py-3 text-sm placeholder:opacity-80 transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label="Nom de votre habitude"
            />
        </div>
    );
}