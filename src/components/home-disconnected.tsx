import { Button } from "@/components/ui/button";
import LogoSlogan from "@/components/ui/logo-slogan";

export default function HomeDisconnected() {
    return (
        <main
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
            role="main"
        >
            <section aria-labelledby="home-title" className="flex flex-col gap-15">
                <LogoSlogan />
                <nav aria-label="Actions principales" className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Button href="/signup" className="w-full sm:w-auto">
                        Commencer gratuitement
                    </Button>
                    <a href="/login" className="text-primary font-medium">
                        J'ai déjà un compte
                    </a>
                </nav>
            </section>
        </main>
    );
}