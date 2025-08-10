export default () => ({
  app: {
    name: 'Market Summary API',
    version: '1.0.0',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  apiKeys: {
    alphaVantage: process.env.ALPHA_VANTAGE_API_KEY,
    yahooFinance: process.env.YAHOO_FINANCE_API_KEY,
  },
  throttling: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  websocket: {
    port: parseInt(process.env.WS_PORT || '3001', 10),
  },
  externalApis: {
    afr: process.env.AFR_BASE_URL || 'https://www.afr.com',
    asx: process.env.ASX_API_URL || 'https://www.asx.com.au',
    rba: process.env.RBA_API_URL || 'https://www.rba.gov.au',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
    maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
  },
  monitoring: {
    enabled: process.env.ENABLE_METRICS === 'true',
    port: parseInt(process.env.METRICS_PORT || '9090', 10),
  },
});
