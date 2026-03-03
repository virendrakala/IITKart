import jwt from 'jsonwebtoken';

/**
 * Generates a JSON Web Token for user authentication
 * @param userId - The ID of the user
 * @param role - The role of the user (e.g., CUSTOMER, VENDOR)
 * @returns Signed JWT string
 */
export const generateToken = (userId: number, role: string): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in .env file');
  }

  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: '7d',
  });
};
