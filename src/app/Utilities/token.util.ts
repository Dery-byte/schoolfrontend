// src/app/utils/token.util.ts
import {jwtDecode} from 'jwt-decode';

/**
 * Interface representing the structure of the decoded JWT token.
 */
export interface DecodedToken {
  sub: string; // Subject (usually the user ID)
  exp: number; // Expiration time
  iat: number; // Issued at
  authorities: string[]; // Roles or authorities
}

/**
 * Decodes a JWT token and returns the decoded payload.
 * @param token - The JWT token to decode.
 * @returns The decoded token payload or null if decoding fails.
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}