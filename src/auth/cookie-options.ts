/**
 * Opções para cookies de auth (ex.: refresh token).
 * Use com res.cookie(name, value, COOKIE_OPTIONS) em endpoints que setam cookie.
 * CORS está configurado com credentials: true no main.ts para permitir envio de cookies.
 */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias (ajuste conforme refresh token)
};
