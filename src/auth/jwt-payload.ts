/**
 * Payload do JWT (access token). Definido ao fazer sign no AuthService.
 * req.user no JwtAuthGuard terá esta forma.
 */
export interface JwtPayload {
  sub: string;
  email?: string;
  isSystemAdmin?: boolean;
}
