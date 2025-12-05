import { useEffect, useState } from "react";
import { BadgeIcons } from "@/components/ui/icons";
import { Badge} from "@/app/types";

export default function BadgesIllustration() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/badges")
            .then((res) => res.json())
            .then((data) => {
                setBadges(data.badges || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div>Chargement des badges...</div>;

    return (
        <div>
            <h1 className="text-xl font-semibold mb-6">Tous les badges que vous pouvez obtenir :</h1>
            <div
                className="flex flex-wrap gap-1 justify-center w-full max-w-[360px] mx-auto content-center"
            >
                {badges.map((badge) => (
                    <div
                        key={badge.id}
                        className="flex flex-col items-center p-4"
                        style={{ width: "calc(33.333% - 4px)", boxSizing: "border-box" }}
                    >
                        {badge.icon && BadgeIcons[badge.icon]()}
                        <div className="mt-2 text-lg font-bold">{badge.name}</div>
                        <div className="text-sm text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                            {badge.description}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}