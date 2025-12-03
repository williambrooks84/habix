import sql from './database'

export async function getProfilePicture(email: string): Promise<string | null> {
  const result = await sql`
    SELECT profile_picture 
    FROM users 
    WHERE email = ${email}
  `;
  
  return result[0]?.profile_picture || null;
}

export async function updateProfilePicture(email: string, dataUrl: string): Promise<void> {
  await sql`
    UPDATE users 
    SET profile_picture = ${dataUrl}
    WHERE email = ${email}
  `;
}

