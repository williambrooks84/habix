"use client";
import type { LogosProps } from '@/types/ui';
import Image from "next/image";
import React from "react";

function useEffectiveTheme() {
	const getInitial = (): boolean | null => {
		if (typeof window === 'undefined') return null;
		try {
			const stored = localStorage.getItem('theme');
			if (stored === 'dark') return true;
			if (stored === 'light') return false;
		} catch (e) {
		}

		try {
			const html = document.documentElement;
			const data = html.getAttribute('data-theme');
			if (data === 'dark') return true;
			if (data === 'light') return false;
			if (html.classList.contains('dark')) return true;
		} catch (e) {
		}

		try {
			const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
			if (mq) return !!mq.matches;
		} catch (e) {}

		return false;
	};

	const [prefersDark, setPrefersDark] = React.useState<boolean | null>(getInitial);

	React.useEffect(() => {
		if (typeof window === 'undefined') return;

		// sync immediately on mount
		setPrefersDark(getInitial());

		// watch for changes from other tabs/localStorage
		const onStorage = (e: StorageEvent) => {
			if (e.key === 'theme') {
				setPrefersDark(e.newValue === 'dark');
			}
		};
		window.addEventListener('storage', onStorage);

		// media query listener (with backward-compatible addListener)
		let mq: MediaQueryList | null = null;
		let mqHandler: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;
		try {
			mq = window.matchMedia('(prefers-color-scheme: dark)');
			mqHandler = (ev: MediaQueryListEvent) => setPrefersDark(ev.matches);
			if (typeof mq.addEventListener === 'function') {
				mq.addEventListener('change', mqHandler as any);
			} else if (typeof (mq as any).addListener === 'function') {
				(mq as any).addListener(mqHandler);
			}
		} catch (e) {
			mq = null;
			mqHandler = null;
		}

		// observe attribute/class changes on <html> to detect theme toggles
		const html = document.documentElement;
		const mo = new MutationObserver(() => setPrefersDark(getInitial()));
		try {
			mo.observe(html, { attributes: true, attributeFilter: ['data-theme', 'class'] });
		} catch (e) {}

		return () => {
			window.removeEventListener('storage', onStorage);
			try {
				if (mq && mqHandler) {
					if (typeof mq.removeEventListener === 'function') {
						mq.removeEventListener('change', mqHandler as any);
					} else if (typeof (mq as any).removeListener === 'function') {
						(mq as any).removeListener(mqHandler);
					}
				}
			} catch (e) {}
			try { mo.disconnect(); } catch (e) {}
		};
	}, []);

	return prefersDark;
}

export default function Logo({ variant = 1, mode = "auto", className = "", size }: LogosProps) {
	const prefersDark = useEffectiveTheme();
	const isDark = mode === 'dark' || (mode === 'auto' && prefersDark === true);

	const base = variant === 1 ? "/assets/logo" : "/assets/logo2";
	const file = isDark
		? `${base}/${variant === 1 ? "logo-dark.svg" : "logo2-dark.svg"}`
		: `${base}/${variant === 1 ? "logo.svg" : "logo2.svg"}`;

	const isSvg = file.endsWith(".svg");

	return (
		<div className={`inline-block ${className}`}>
			{isSvg ? (
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