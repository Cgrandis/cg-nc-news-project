const { Pool } = require('pg');

const ENV = process.env.NODE_ENV || 'development';
const config = {};

require('dotenv').config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error('PGDATABASE not set');
}

if (ENV === 'production') {
  config.connectionString = process.env.DATABASE_URL;
  config.ssl = {
    rejectUnauthorized: false, // Necessary for some hosted databases like Supabase
  };
  config.max = 2;
} else {
  config.database = process.env.PGDATABASE; // For development, use local PGDATABASE
}

module.exports = new Pool(config);
