import Logo from "@/components/ui/logo";

export default function Header() {
    return (
        <header className="flex flex-col items-center mb-8">
            <figure className="w-full max-w-[260px] mx-auto text-center">
                {/* explicit wrapper ensures the logo participates in normal flow */}
                <div className="flex justify-center mb-6">
                    <div className="inline-block">
                        <Logo variant={1} mode="dark" />
                    </div>
                </div>
            </figure>
            <p className="text-sm">
                Suivez vos habitudes, transformez votre vie
            </p>
        </header>
    )
}