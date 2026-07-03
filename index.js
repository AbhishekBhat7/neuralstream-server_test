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