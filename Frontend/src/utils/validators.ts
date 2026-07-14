const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^\+?[0-9]{7,15}$/;

export function isEmailFormat(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isMobileFormat(value: string): boolean {
  return MOBILE_REGEX.test(value.trim().replace(/[\s-]/g, ""));
}
