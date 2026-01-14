import * as bcrypt from 'bcrypt';

/**
 * Hashes a password using bcrypt
 * @param password - The plain text password to hash
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(
  password: string,
  saltRounds: number = 10,
): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a hashed password
 * @param plainPassword - The plain text password to compare
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise<boolean> - True if passwords match, false otherwise
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
