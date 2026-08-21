const PLACEHOLDER_JWT_SECRET = 'your-jwt-secret-change-in-production';
const PLACEHOLDER_INTERNAL_SECRET = 'your-internal-secret-change-in-production';

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

// Fail fast at boot: with the old `|| 'change-me'` fallback a service deployed
// without INTERNAL_SERVICE_SECRET would accept any service-to-service call
// authenticated with the well-known default.
function requireInternalSecret(): string {
  const secret = process.env.INTERNAL_SERVICE_SECRET;
  if (!secret) {
    throw new Error('INTERNAL_SERVICE_SECRET is not set - refusing to start with a built-in default secret');
  }
  if (process.env.NODE_ENV === 'production' && secret === PLACEHOLDER_INTERNAL_SECRET) {
    throw new Error('INTERNAL_SERVICE_SECRET is still the .env.example placeholder - set a real secret');
  }
  return secret;
}

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3007,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: requireJwtSecret(),
  },
  internal: {
    secret: requireInternalSecret(),
  },
  feedService: {
    url: process.env.FEED_SERVICE_URL || 'http://localhost:3010',
  },
  notificationService: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3013',
  },
});
