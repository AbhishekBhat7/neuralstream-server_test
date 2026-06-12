// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//   rejectUnauthorized: false
// }
// });

// module.exports = pool;


const { Pool } = require('pg');
require('dotenv').config();

// Database connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  // ssl: process.env.POSTGRES_SSL === 'require' ? { rejectUnauthorized: true } : false,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, 
});
console.log('DB Host:', process.env.POSTGRES_HOST);
console.log('DB User:', process.env.POSTGRES_USER);
pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database.");
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL database", err.stack);
  });

module.exports = pool;
