"use client";

import React from 'react';
import clsx from 'clsx';
import { FormUIProps } from '@/types/ui';
import FormLabel from './form-label';

export default function FormField({ id, name, value, defaultValue, onChange, placeholder, className, }: FormUIProps & { rows?: number }) {
	const rows = (arguments[0] as any)?.rows ?? 3;

	return (
		<div className={clsx('flex flex-col items-start w-full gap-3', className)}>
			<FormLabel id={id} label="Description" />

			<textarea
				id={id}
				name={name}
				value={value}
				defaultValue={defaultValue}
				onChange={(e) => onChange?.(e.target.value)}
				placeholder={placeholder}
				rows={rows}
				className="w-full rounded-xl border-3 border-foreground px-4 py-3 text-sm placeholder:opacity-80 transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
				aria-label="Description"
			/>
		</div>
	);
}