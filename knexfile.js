require('dotenv').config();

const config = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || '43.216.155.73',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'dssb',
      password: process.env.DB_PASSWORD || 'dssb@123',
      database: process.env.DB_NAME || 'NAS_PROTO',
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'js',
    },
    seeds: {
      directory: './src/database/seeds',
    },
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'js',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

module.exports = config; 