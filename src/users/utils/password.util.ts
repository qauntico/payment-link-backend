import * as bcrypt from 'bcrypt';

// Hashes a password using bcrypt
export async function hashPassword(
  password: string,
  saltRounds: number = 10,
): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

//Compares a plain text password with a hashed password
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
