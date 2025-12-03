import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useProfilePicture } from '@/components/wrappers/ProfilePictureContext';

function getInitials(name?: string) {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar() {
    const { data: session } = useSession();
    const { profilePictureUrl, updateProfilePicture } = useProfilePicture();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.email) {
            fetch('/api/profile/picture')
                .then(res => res.json())
                .then(data => {
                    updateProfilePicture(data.profile_picture || null);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [session]);

    if (profilePictureUrl) {
        return (
            <img
                src={profilePictureUrl}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-muted"
            />
        );
    }

    const initials = getInitials(session?.user?.name || session?.user?.email || '');
    return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-background border-2 border-primary">
            <span className="text-primary font-bold text-base">{initials}</span>
        </div>
    );
}