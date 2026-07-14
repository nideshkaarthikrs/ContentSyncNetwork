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
  notificationService: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3013',
  },
});
