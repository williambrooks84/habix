"use client";
import type { LogosProps } from '@/types/ui';
import Image from "next/image";
import React from "react";

function usePrefersDark() {
	const [prefersDark, setPrefersDark] = React.useState<boolean | null>(null);
	React.useEffect(() => {
		if (typeof window === "undefined") return;
		const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
		const update = () => setPrefersDark(!!mq?.matches);
		update();
		mq?.addEventListener?.("change", update);
		return () => mq?.removeEventListener?.("change", update);
	}, []);
	return prefersDark;
}

export default function Logo({ variant = 1, mode = "auto", className = "", size }: LogosProps) {
	const prefersDark = usePrefersDark();
	const isDark = mode === "dark" || (mode === "auto" && prefersDark === true);

	const base = variant === 1 ? "/assets/logo" : "/assets/logo2";
	const file = isDark
		? `${base}/${variant === 1 ? "logo-dark.svg" : "logo2-dark.svg"}`
		: `${base}/${variant === 1 ? "logo.svg" : "logo2.svg"}`;

	const isSvg = file.endsWith(".svg");

	return (
		// inline-block ensures this wrapper participates in normal flow and margins work predictably
		<div className={`inline-block ${className}`}>
			{isSvg ? (
				// Render img as block so it doesn't leave inline-gap or baseline offsets
				<img
					src={file}
					alt="logo"
					style={size ? { width: size, height: size, display: 'block' } : { display: 'block' }}
				/>
			) : (
				<Image src={file} alt="logo" width={size ?? 64} height={size ?? 64} style={{ display: 'block' }} />
			)}
		</div>
	);
}