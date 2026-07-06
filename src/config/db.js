// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//   rejectUnauthorized: false
// }
// });

// module.exports = pool;


// const { Pool } = require('pg');
// require('dotenv').config();

// // Database connection pool
// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT || 5432,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME, 
//   ssl: false,
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 5000, 
// });
// console.log('DB Host:', process.env.DB_HOST);
// console.log('DB User:', process.env.DB_USER);
// pool
//   .connect()
//   .then(() => {
//     console.log("Connected to PostgreSQL database.");
//   })
//   .catch((err) => {
//     console.error("Error connecting to PostgreSQL database", err.stack);
//   });

// module.exports = pool;




const { Pool } = require('pg');

// Only load dotenv in non-Passenger environments
if (!process.env.PASSENGER_APP_ENV) {
    require('dotenv').config();
}

console.log('DB Config Check:');
console.log('  Host:', process.env.DB_HOST);
console.log('  Port:', process.env.DB_PORT);
console.log('  User:', process.env.DB_USER);
console.log('  Database:', process.env.DB_NAME);

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Test connection on startup
pool.connect()
    .then(client => {
        console.log("✓ Connected to PostgreSQL database successfully");
        client.release(); // Release the client back to pool
    })
    .catch(err => {
        console.error("✗ Error connecting to PostgreSQL:", err.message);
        console.error("Stack:", err.stack);
    });

module.exports = pool;