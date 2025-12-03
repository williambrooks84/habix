"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { useSession } from 'next-auth/react';
import { useProfilePicture } from '@/components/wrappers/ProfilePictureContext';

interface ProfilePictureUploadProps {
  currentUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
}

function getInitials(name?: string) {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePictureUpload({ currentUrl, onUploadSuccess }: ProfilePictureUploadProps) {
  const { data: session } = useSession();
  const { updateProfilePicture } = useProfilePicture();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    setError(null);
    setCompressing(true);

    try {
      let processedFile = file;
      
      if (file.size > 1 * 1024 * 1024) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          fileType: file.type,
        };

        processedFile = await imageCompression(file, options);
      }

      setPendingFile(processedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
    } catch (err) {
      setError('Erreur lors de la compression de l\'image');
      console.error('Compression error:', err);
    } finally {
      setCompressing(false);
    }
  };

  const handleConfirm = async () => {
    if (!pendingFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', pendingFile);

      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      setPreview(data.url);
      setPendingFile(null);
      onUploadSuccess?.(data.url);
      updateProfilePicture(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
      setPreview(currentUrl || null);
      setPendingFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPendingFile(null);
    setPreview(currentUrl || null);
    setError(null);
  };

  const initials = getInitials(session?.user?.name || session?.user?.email || '');

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
        {preview ? (
          <Image
            src={preview}
            alt="Photo de profil"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-background flex items-center justify-center">
            <span className="text-primary font-bold text-2xl">
              {initials}
            </span>
          </div>
        )}
      </div>

      {compressing ? (
        <p className="text-sm text-muted-foreground">Compression en cours...</p>
      ) : !pendingFile ? (
        <>
          <label htmlFor="profile-picture-input">
            <Button
              variant="primary"
              size="small"
              disabled={uploading}
              onClick={() => document.getElementById('profile-picture-input')?.click()}
            >
              Changer la photo
            </Button>
          </label>

          <input
            id="profile-picture-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="small"
            disabled={uploading}
            onClick={handleConfirm}
          >
            {uploading ? 'Téléchargement...' : 'Confirmer'}
          </Button>
          <Button
            variant="primaryOutline"
            size="small"
            disabled={uploading}
            onClick={handleCancel}
          >
            Annuler
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}