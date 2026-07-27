export default () => ({
  port: parseInt(process.env.PORT, 10) || 3011,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
  },
  internal: {
    secret: process.env.INTERNAL_SERVICE_SECRET || 'change-me',
  },
  paymentService: {
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3012',
  },
  tuneService: {
    url: process.env.TUNE_SERVICE_URL || 'http://localhost:3003',
  },
  videoService: {
    url: process.env.VIDEO_SERVICE_URL || 'http://localhost:3006',
  },
  notificationService: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3013',
  },
});
