/** 30 dias em segundos para Max-Age do refresh token */
export const REFRESH_COOKIE_MAX_AGE_SEC = 30 * 24 * 60 * 60;

/**
 * Opções para cookie refresh_token (HttpOnly, Secure em prod, SameSite=Lax).
 * CORS com credentials: true no main.ts para envio de cookies.
 */
export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/' as const,
  maxAge: REFRESH_COOKIE_MAX_AGE_SEC,
};
