import Logo from "@/components/ui/logo";

export default function Header() {
    return (
        <header className="flex flex-col items-center gap-3">
            <figure className="max-w-90 mx-auto">
                <div className="flex justify-center">
                    <Logo variant={1} />
                </div>
            </figure>
            <p className="text-lg text-foreground">
                Suivez vos habitudes, transformez votre vie
            </p>
        </header>
    )
}