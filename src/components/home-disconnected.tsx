import { Button } from "@/components/ui/button";
import LogoSlogan from "@/components/ui/logo-slogan";

export default function HomeDisconnected() {
    return (
        <section className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center">
            <div className="flex flex-col gap-15">
                <LogoSlogan />
                <nav aria-label="Actions principales" className="flex flex-col gap-4 items-center justify-center">
                    <Button href="/signup" className="w-full sm:w-auto">
                        Commencer gratuitement
                    </Button>
                    <a href="/login" className="text-primary font-medium">
                        J'ai déjà un compte
                    </a>
                </nav>
            </div>
        </section>
    );
}