import { randomBytes } from 'crypto';

/**
 * Generates a unique slug for a product
 * @returns A unique random slug (e.g., "abc123xyz")
 */
export function generateSlug(): string {
  // Generate a random 12-character slug
  return randomBytes(6).toString('hex');
}

/**
 * Generates a payment link URL with product ID
 * @param productId - The ID of the product
 * @param baseUrl - The base URL of the application (default: from env or localhost)
 * @returns The full payment link URL
 */
export function generatePaymentLink(productId: number, baseUrl?: string): string {
  const appBaseUrl = baseUrl || process.env.APP_BASE_URL || 'http://localhost:3000';
  return `${appBaseUrl}/pay?productId=${productId}`;
}
