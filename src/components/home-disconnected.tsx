import Header from "@/components/ui/auth/header";
import { Button } from "@/components/ui/button";

export default function HomeDisconnected() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-15">
            <Header />
            <main>
                <div className="flex flex-col gap-6">
                    <Button href="/signup">Commencer gratuitement</Button>
                    <a href="/login" className="text-primary font-medium ml-2">
                        J'ai déjà un compte
                    </a>
                </div>
            </main>
        </div>
    )
}