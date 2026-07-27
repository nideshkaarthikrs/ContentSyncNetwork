const PLACEHOLDER_JWT_SECRET = 'your-jwt-secret-change-in-production';

// Fail fast at boot: with the old `|| 'change-me'` fallback a service deployed
// without JWT_SECRET would happily accept tokens signed with a public constant.
function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set - refusing to start with a built-in default secret');
  }
  if (process.env.NODE_ENV === 'production' && secret === PLACEHOLDER_JWT_SECRET) {
    throw new Error('JWT_SECRET is still the .env.example placeholder - set a real secret');
  }
  return secret;
}

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: requireJwtSecret(),
    expiry: process.env.JWT_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
});
