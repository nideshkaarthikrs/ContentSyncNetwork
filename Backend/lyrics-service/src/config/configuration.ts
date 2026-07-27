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
  port: parseInt(process.env.PORT, 10) || 3004,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: requireJwtSecret(),
  },
  internal: {
    secret: process.env.INTERNAL_SERVICE_SECRET || 'change-me',
  },
  tuneService: {
    url: process.env.TUNE_SERVICE_URL || 'http://localhost:3003',
  },
});
