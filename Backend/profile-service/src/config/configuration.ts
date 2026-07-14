export default () => ({
  port: parseInt(process.env.PORT, 10) || 3002,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
  },
  internal: {
    secret: process.env.INTERNAL_SERVICE_SECRET || 'change-me',
  },
  notificationService: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3013',
  },
});
