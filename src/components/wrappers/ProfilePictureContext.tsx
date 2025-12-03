"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfilePictureContextType {
  profilePictureUrl: string | null;
  updateProfilePicture: (url: string | null) => void;
}

const ProfilePictureContext = createContext<ProfilePictureContextType | undefined>(undefined);

export function ProfilePictureProvider({ children }: { children: ReactNode }) {
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  const updateProfilePicture = (url: string | null) => {
    setProfilePictureUrl(url);
  };

  return (
    <ProfilePictureContext.Provider value={{ profilePictureUrl, updateProfilePicture }}>
      {children}
    </ProfilePictureContext.Provider>
  );
}

export function useProfilePicture() {
  const context = useContext(ProfilePictureContext);
  if (context === undefined) {
    throw new Error('useProfilePicture must be used within a ProfilePictureProvider');
  }
  return context;
}