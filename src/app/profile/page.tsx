"use client";

import { useSession } from 'next-auth/react';
import LoginPopin from '@/components/ui/auth/login-popin';
import ProfilePictureUpload from '@/components/ui/profile/profile-picture-upload';
import { useEffect, useState } from 'react';
import { BadgeIcons } from '@/components/ui/icons';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [currentPicture, setCurrentPicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetch('/api/profile/picture')
        .then(res => res.json())
        .then(data => {
          setCurrentPicture(data.profile_picture || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session]);

  if (status === 'loading' || loading) {
    return <div className="flex flex-col px-6 py-8">Chargement...</div>;
  }

  if (status === 'unauthenticated') {
    return <LoginPopin />;
  }

  return (
    <div className="flex flex-col px-6 py-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Mon profil</h1>
      <section className="flex flex-col items-center">
        <ProfilePictureUpload
          currentUrl={currentPicture}
          onUploadSuccess={(url) => setCurrentPicture(url)}
        />
        <div className="mt-8 text-center">
          <p className="text-foreground text-3xl font-medium">{session?.user?.name || 'Utilisateur'}</p>
        </div>
      </section>
      {/* <div>
        <BadgeIcons.Bronze />
        <BadgeIcons.Silver />
        <BadgeIcons.Gold />
        <BadgeIcons.Platinum />
        <BadgeIcons.Diamond />
        <BadgeIcons.Master />
        <BadgeIcons.Legend />
        <BadgeIcons.Mythic />
      </div> */}
    </div>
  );
}