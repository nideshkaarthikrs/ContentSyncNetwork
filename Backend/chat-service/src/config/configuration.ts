export default () => ({
  port: parseInt(process.env.PORT, 10) || 3008,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
  },
  internal: {
    secret: process.env.INTERNAL_SERVICE_SECRET || 'change-me',
  },
  projectService: {
    url: process.env.PROJECT_SERVICE_URL || 'http://localhost:3007',
  },
});
