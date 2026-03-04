export const ADMIN_EMAIL = "mrockuw@seznam.cz";

export function isAdminEmail(email?: string | null) {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}