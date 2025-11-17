"use client";
import dynamic from 'next/dynamic';

const Logo = dynamic(() => import('@/components/ui/logo'), { ssr: true });

export default function Header() {
    return (
        <header className="flex flex-col items-center gap-3">
            <figure className="max-w-70 mx-auto">
                <div className="flex justify-center">
                    <Logo variant={1} />
                </div>
            </figure>
            <p className="text-sm text-foreground">
                Suivez vos habitudes, transformez votre vie
            </p>
        </header>
    )
}