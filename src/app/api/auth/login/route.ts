import sql from '../../../lib/database';
import { verifyPassword } from '../../../lib/auth-utils';
import { toUserResponse } from '../../../lib/database';
import { LoginInput } from '../../../types';

export async function POST(request: Request) {
  try {
    const { email, password }: LoginInput = await request.json();

    // Find user by email
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (result.length === 0) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result[0];

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userResponse = toUserResponse(user);
    return Response.json({ user: userResponse });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}