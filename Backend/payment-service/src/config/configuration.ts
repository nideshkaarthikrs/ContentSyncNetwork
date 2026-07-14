export default () => ({
  port: parseInt(process.env.PORT, 10) || 3012,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
  },
  internal: {
    secret: process.env.INTERNAL_SERVICE_SECRET || 'change-me',
  },
});
