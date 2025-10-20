import sql from '../../../lib/database';
import { hashPassword } from '../../../lib/auth-utils';
import { toUserResponse } from '../../../lib/database';

type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password }: CreateUserInput = await request.json();

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return Response.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    
    const result = await sql`
      INSERT INTO users (first_name, last_name, email, password_hash) 
      VALUES (${firstName}, ${lastName}, ${email}, ${passwordHash}) 
      RETURNING *
    `;

    const user = toUserResponse(result[0]);
    return Response.json({ user }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}