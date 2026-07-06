// require("dotenv").config();

// const express = require("express");
// const http = require("http");

// const authRoutes =
//   require("./src/mobile/routes/authRoute");
// const sessionRoutes =
//   require("./src/mobile/routes/sessionRoute");

// const initializeWebSocket = require("./src/mobile/websocket/websocket");

// const app = express();

// app.use(express.json());

// app.use(
//   "/api",
//   authRoutes
// );
// app.use(
//   "/api",
//   sessionRoutes
// );

// app.get("/", (req, res) => {
//   res.send(
//     "Welcome to the NeuralStream API this is testing"
//   );
// });

// const server = http.createServer(app);
// // for production use below
// // const server = https.createServer(sslOptions, app);

// initializeWebSocket(server);

// // app.listen(
// //   process.env.PORT || 3000,
// //   () => {
// //     console.log(
// //       "Server Started"
// //     );
// //   }
// // );

// server.listen(process.env.PORT || 3000, () => {
//     console.log(`Server Started on ${process.env.PORT || 3000}`);
// });


// index.js
// require("dotenv").config();

// const express = require("express");
// const http = require("http");

// const authRoutes = require("./src/mobile/routes/authRoute");
// const sessionRoutes = require("./src/mobile/routes/sessionRoute");
// const initializeWebSocket = require("./src/mobile/websocket/websocket");

// const app = express();
// app.use(express.json());
// app.use("/api", authRoutes);
// app.use("/api", sessionRoutes);

// app.get("/", (req, res) => {
//     res.send("Welcome to the NeuralStream API1");
// });

// // Main HTTP server for Express (Passenger manages this)
// const server = http.createServer(app);

// // Separate HTTP server just for WebSocket
// // This bypasses Passenger completely
// const wsServer = http.createServer();

// initializeWebSocket(wsServer);

// server.listen(process.env.PORT || 3000, () => {
//     console.log(`HTTP Server Started on ${process.env.PORT || 3000}`);
// });

// // WebSocket on separate port
// wsServer.listen(process.env.WS_PORT || 3001, () => {
//     console.log(`WebSocket Server Started on ${process.env.WS_PORT || 3001}`);
// });













// if (!process.env.DB_HOST) {
//     require("dotenv").config();
// }
require("dotenv").config();
console.log("DB Host:", process.env.DB_HOST);
console.log("DB User:", process.env.DB_USER);

const express = require("express");
const http = require("http");

const authRoutes = require("./src/mobile/routes/authRoute");
const sessionRoutes = require("./src/mobile/routes/sessionRoute");
const initializeWebSocket = require("./src/mobile/websocket/websocket");

const app = express();
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", sessionRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the NeuralStream API");
});
app.get("/test", (req, res) => {
    res.json({ 
        status: "ok",
        db_host: process.env.DB_HOST,
        db_user: process.env.DB_USER,
        node_env: process.env.NODE_ENV
    });
});
// ONE single HTTP server for both Express and WebSocket
const server = http.createServer(app);

// Attach WebSocket to the SAME server (shares port with Express)
initializeWebSocket(server);

// ============================================
// CRITICAL FIX:
// Only call listen() when running locally
// Passenger calls listen() automatically on shared hosting
// ============================================
if (!process.env.PASSENGER_APP_ENV) {
    // Local development: node index.js
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server Started on ${PORT}`);
        console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
    });
} else {
    // A2 Hosting / Passenger - no listen() needed
    console.log("Server Started via Passenger");
    console.log("WebSocket available at wss://yourdomain.com/ws");
}

app.use((req, res, next) => {
    res.status(404).json({ 
        error: "Route not found",
        path: req.path,
        method: req.method
    });
});

// Handle ALL errors - shows real error in response
app.use((err, req, res, next) => {
    console.error("=== SERVER ERROR ===");
    console.error("Path:", req.path);
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    console.error("===================");
    
    res.status(500).json({
        error: err.message,
        path: req.path
    });
});

module.exports = server;
index.js

htaccess file
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/rosettes/neuralstream.server"
PassengerBaseURI "/"
PassengerNodejs "/home/rosettes/nodevenv/neuralstream.server/20/bin/node"
PassengerAppType node
PassengerStartupFile index.js
PassengerAppLogFile "/home/rosettes/logs/neuralstream.log"
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
# DO NOT REMOVE OR MODIFY. CLOUDLINUX ENV VARS CONFIGURATION BEGIN
<IfModule Litespeed>
SetEnv DATABASE_URL postgresql://neondb_owner:npg_6KQJtZPoReX7@ep-jolly-bird-apy0icb5-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SetEnv DB_HOST localhost
SetEnv DB_NAME rosettes_neuralstream
SetEnv DB_PASSWORD admin123@$%
SetEnv DB_PORT 5432
SetEnv DB_USER rosettes_neuralstream_user
SetEnv JWT_SECRET 682ef2ef199c9ce5faf91e72067add53bd2ba5284b79e15256a502726493516d76aed66f4998943e0f1ade14ec8c5e089f0158c8408e29e0639152ff8de44f2c
SetEnv ACCESS_TOKEN_EXPIRY 30m
SetEnv REFRESH_TOKEN_VALIDITY_DAYS 60
</IfModule>
# DO NOT REMOVE OR MODIFY. CLOUDLINUX ENV VARS CONFIGURATION END

.env
DB_HOST=localhost
DB_PORT=5432
DB_USER=rosettes_neuralstream_user
DB_PASSWORD=admin123@$%
DB_NAME=rosettes_neuralstream
JWT_SECRET=682ef2ef199c9ce5faf91e72067add53bd2ba5284b79e15256a502726493516d76aed66f4998943e0f1ade14ec8c5e089f0158c8408e2$
ACCESS_TOKEN_EXPIRY=30m
REFRESH_TOKEN_VALIDITY_DAYS=60

db.js
const { Pool } = require('pg');
require('dotenv').config();

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, 
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, 
});
console.log('DB Host:', process.env.DB_HOST);
console.log('DB User:', process.env.DB_USER);
pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database.");
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL database", err.stack);
  });

module.exports = pool;

here look at the structures i had uploaded here if i do run the server locally i wont get any issues in running but if i deploy to the A2 hosting and i am getting the log msg as
App 2773436 output: ◇ injected env (0) from .env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
App 2773436 output: DB Host: localhost
App 2773436 output: DB User: rosettes_neuralstream_user
App 2773436 output: ◇ injected env (0) from .env // tip: ⌘ override existing { override: true }
App 2773436 output: DB Host: localhost
App 2773436 output: DB User: rosettes_neuralstream_user
App 2773436 output: WebSocket Server Started
App 2773436 output: Server Started via Passenger
App 2773436 output: WebSocket available at wss://yourdomain.com/ws
App 2773436 output: Connected to PostgreSQL database.
but if i go to the url and try to run that i am getting the 500 internal server error so can u identify the error where i am actually getting and i confirmed that the db connection of the server side is correct


this is the error msg
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>We're sorry, but something went wrong: Web application could not be started</title>
    <style type="text/css">body{color:#222;font-family:Arial,Sans-Serif;font-size:13px;margin:0}.column{margin-left:auto;margin-right:auto;max-width:1000px;text-align:center}header{border-bottom:1px solid #e3e3e3;margin-bottom:45px}footer,header{margin-top:50px}footer{border-top:1px solid #e3e3e3;color:#7f7f7f;font-size:14px;padding:40px 0}h1{font-size:30px;margin-bottom:10px;margin-top:30px}.subtitle{font-size:20px;margin-bottom:110px;margin-top:0}#operator_info{display:none}#show_operator_info{font-size:17px;font-weight:400}.left{padding:8px;text-align:left}h3{font-size:23px;margin-bottom:10px;margin-top:30px}ul{padding-left:16px}a,li{color:#1781bf;text-decoration:none}.error,a,li{font-weight:700}.error{background:#e6f3fc;border-radius:5px;padding:7px 12px}.error.block{display:block}.bold{font-weight:700!important}pre{margin:0;overflow-x:auto;white-space:pre-wrap;word-break:break-all}dt{font-weight:700;margin-top:16px}dd{margin-left:0}.plain{color:inherit;font-weight:inherit}#content{height:800px;overflow-y:scroll}</style>
  </head>
  <body>
    <header>
      <div class="column">
        <svg width="50" height="50" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="m731.234002 153.838666v-18.841339c0-4.417534-3.577416-7.997327-7.990382-7.997327h-6.414571c-4.417012 0-7.990383 3.580525-7.990383 7.997327v18.841339h-18.841339c-4.417534 0-7.997327 3.577416-7.997327 7.990383v6.414571c0 4.417011 3.580525 7.990382 7.997327 7.990382h18.841339v18.841339c0 4.417534 3.577416 7.997328 7.990383 7.997328h6.414571c4.417011 0 7.990382-3.580526 7.990382-7.997328v-18.841339h18.841339c4.417534 0 7.997328-3.577416 7.997328-7.990382v-6.414571c0-4.417012-3.580526-7.990383-7.997328-7.990383z" fill="#f87575" transform="matrix(.70710678 -.70710678 .70710678 .70710678 -593.80455139 424.48059756)"/></svg>
        <h1>We're sorry, but something went wrong.</h1>
        <p class="subtitle">The issue has been logged for investigation. Please try again later.</p>
      </div>
    </header>
    <div class="column">
      <a id="show_operator_info" href="#" onclick="showOperatorInfo()">Technical details for the administrator of this website</a>
      <div id="operator_info">
        <div class="left">
          <h3>Error ID:</h3>
          <span class="error">a774e8e8</span>
          <h3>Details:</h3>
          <p>Web application could not be started by the Phusion Passenger(R) application server.</p>
          <p class="bold">Please read <a href="https://www.phusionpassenger.com/library/admin/log_file/" class="plain">the Passenger log file</a> (search for the Error ID) to find the details of the error.</p>
          <p>You can also get a detailed report to appear directly on this page, but for security reasons it is only provided if Phusion Passenger(R) is run with <i>environment</i> set to <i>development</i> and/or with the <i>friendly error pages</i> option set to <i>on</i>.</p>
          <p>For more information about configuring environment and friendly error pages, see:</p>
          <ul>
            <li><a href="https://www.phusionpassenger.com/library/config/nginx/reference/#passenger_friendly_error_pages">Nginx integration mode</a></li>
            <li><a href="https://www.phusionpassenger.com/library/config/apache/reference/#passengerfriendlyerrorpages">Apache integration mode</a></li>
            <li><a href="https://www.phusionpassenger.com/library/config/standalone/reference/#--friendly-error-pages---no-friendly-error-pages-friendly_error_pages">Standalone mode</a></li>
          </ul>
        </div>
      </div>
    </div>