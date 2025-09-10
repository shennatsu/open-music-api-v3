const path = require('path');

const config = {
  app: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 5000,
    baseUrl: process.env.APP_BASE_URL || '',
  },
  rabbitMq: { server: process.env.RABBITMQ_SERVER || 'amp://localhost', },
  redis: { host: process.env.REDIS_SERVER || '127.0.0.1' },
  storage: { uploadsDir: process.env.UPLOADS_DIR || path.resolve(__dirname, '../../uploads') },
};

module.exports = config;
