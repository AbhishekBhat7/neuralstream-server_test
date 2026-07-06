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
// require("dotenv").config();
// console.log("DB Host:", process.env.DB_HOST);
// console.log("DB User:", process.env.DB_USER);

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
//     res.send("Welcome to the NeuralStream API");
// });
// app.get("/test", (req, res) => {
//     res.json({ 
//         status: "ok",
//         db_host: process.env.DB_HOST,
//         db_user: process.env.DB_USER,
//         node_env: process.env.NODE_ENV
//     });
// });
// // ONE single HTTP server for both Express and WebSocket
// const server = http.createServer(app);

// // Attach WebSocket to the SAME server (shares port with Express)
// initializeWebSocket(server);

// // ============================================
// // CRITICAL FIX:
// // Only call listen() when running locally
// // Passenger calls listen() automatically on shared hosting
// // ============================================
// if (!process.env.PASSENGER_APP_ENV) {
//     // Local development: node index.js
//     const PORT = process.env.PORT || 3000;
//     server.listen(PORT, () => {
//         console.log(`Server Started on ${PORT}`);
//         console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
//     });
// } else {
//     // A2 Hosting / Passenger - no listen() needed
//     console.log("Server Started via Passenger");
//     console.log("WebSocket available at wss://yourdomain.com/ws");
// }

// app.use((req, res, next) => {
//     res.status(404).json({ 
//         error: "Route not found",
//         path: req.path,
//         method: req.method
//     });
// });

// // Handle ALL errors - shows real error in response
// app.use((err, req, res, next) => {
//     console.error("=== SERVER ERROR ===");
//     console.error("Path:", req.path);
//     console.error("Error:", err.message);
//     console.error("Stack:", err.stack);
//     console.error("===================");
    
//     res.status(500).json({
//         error: err.message,
//         path: req.path
//     });
// });

// module.exports = server;









// require("dotenv").config();

// const express = require("express");
// const http = require("http");

// const authRoutes = require("./src/mobile/routes/authRoute");
// const sessionRoutes = require("./src/mobile/routes/sessionRoute");
// const initializeWebSocket = require("./src/mobile/websocket/websocket");

// const app = express();

// // ============================================
// // MIDDLEWARE
// // ============================================
// app.use(express.json());

// // ============================================
// // ROUTES
// // ============================================
// app.use("/api", authRoutes);
// app.use("/api", sessionRoutes);

// app.get("/", (req, res) => {
//     res.send("Welcome to the NeuralStream API");
// });

// app.get("/test", (req, res) => {
//     res.json({
//         status: "ok",
//         db_host: process.env.DB_HOST,
//         db_user: process.env.DB_USER,
//         node_env: process.env.NODE_ENV,
//         passenger: process.env.PASSENGER_APP_ENV || "not set",
//         timestamp: new Date().toISOString()
//     });
// });

// // ============================================
// // 404 Handler
// // ============================================
// app.use((req, res, next) => {
//     res.status(404).json({
//         error: "Route not found",
//         path: req.path,
//         method: req.method
//     });
// });

// // ============================================
// // Global Error Handler
// // ============================================
// app.use((err, req, res, next) => {
//     console.error("=== SERVER ERROR ===");
//     console.error("Path:", req.path);
//     console.error("Error:", err.message);
//     console.error("Stack:", err.stack);
//     console.error("===================");

//     res.status(500).json({
//         error: err.message,
//         path: req.path
//     });
// });

// // ============================================
// // CREATE HTTP SERVER
// // ============================================
// const server = http.createServer(app);

// // ============================================
// // START SERVER
// // ============================================
// if (process.env.PASSENGER_APP_ENV) {
//     // ----------------------------------------
//     // Passenger Environment
//     // ----------------------------------------
//     console.log("Running under Passenger");

//     // Passenger needs a PORT to attach to
//     // It provides this via the PORT environment variable
//     const PORT = process.env.PORT;

//     if (PORT) {
//         console.log("Passenger provided PORT:", PORT);

//         // Attach WebSocket BEFORE listen
//         initializeWebSocket(server);

//         server.listen(PORT, '127.0.0.1', () => {
//             console.log(`Server listening on 127.0.0.1:${PORT}`);
//         });

//     } else {
//         // Passenger older versions use a socket file
//         // Try to get it from environment
//         console.log("No PORT found, checking for socket...");
//         console.log("All ENV keys:", Object.keys(process.env).join(', '));

//         // Attach WebSocket
//         initializeWebSocket(server);

//         // Export app as fallback
//         // Passenger will call listen() itself
//         module.exports = app;
//     }

// } else {
//     // ----------------------------------------
//     // Local Development
//     // ----------------------------------------
//     const PORT = process.env.PORT || 3000;

//     initializeWebSocket(server);

//     server.listen(PORT, () => {
//         console.log(`Server Started on port ${PORT}`);
//         console.log(`HTTP: http://localhost:${PORT}`);
//         console.log(`WebSocket: ws://localhost:${PORT}/ws`);
//     });

//     module.exports = server;
// }




require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./src/mobile/routes/authRoute");
const sessionRoutes = require("./src/mobile/routes/sessionRoute");
const initializeWebSocket = require("./src/mobile/websocket/websocket");

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());

// ============================================
// ROUTES
// ============================================
app.use("/api", authRoutes);
app.use("/api", sessionRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the NeuralStream API");
});

app.get("/test", (req, res) => {
    res.json({
        status: "ok",
        db_host: process.env.DB_HOST,
        node_env: process.env.NODE_ENV,
        passenger: process.env.PASSENGER_APP_ENV || "not set",
        timestamp: new Date().toISOString()
    });
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res, next) => {
    res.status(404).json({
        error: "Route not found",
        path: req.path,
        method: req.method
    });
});

// ============================================
// Global Error Handler
// ============================================
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

// ============================================
// CREATE HTTP SERVER
// ============================================
const server = http.createServer(app);

// ============================================
// PASSENGER FEEDBACK - Tell Passenger we are ready
// ============================================
function notifyPassengerReady() {
    // PASSENGER_USE_FEEDBACK_FD is the file descriptor
    // Passenger listens on this to know app is ready
    const feedbackFd = process.env.PASSENGER_USE_FEEDBACK_FD;
    
    if (feedbackFd) {
        try {
            // Write a single byte "!" to tell Passenger we are ready
            const fd = parseInt(feedbackFd);
            const buf = Buffer.from("!");
            fs.writeSync(fd, buf, 0, buf.length);
            console.log("✓ Passenger notified - app is ready");
        } catch (e) {
            console.log("Could not notify Passenger:", e.message);
        }
    }
}

// ============================================
// START SERVER
// ============================================
if (process.env.PASSENGER_APP_ENV) {
    console.log("Running under Passenger");

    const spawnWorkDir = process.env.PASSENGER_SPAWN_WORK_DIR;

    if (spawnWorkDir) {
        const socketPath = path.join(spawnWorkDir, "stdin.socket");

        console.log("Spawn Work Dir:", spawnWorkDir);
        console.log("Socket Path:", socketPath);

        // Attach WebSocket BEFORE listen
        initializeWebSocket(server);

        // Listen on Unix socket
        server.listen(socketPath, () => {
            console.log(`✓ Server listening on socket`);
            
            // Notify Passenger the app is ready to receive requests
            notifyPassengerReady();
        });

        // Handle server errors
        server.on("error", (err) => {
            console.error("Server error:", err.message);
            console.error("Error code:", err.code);

            if (err.code === "EADDRINUSE") {
                console.log("Socket in use, removing and retrying...");
                try {
                    fs.unlinkSync(socketPath);
                    server.listen(socketPath);
                } catch (unlinkErr) {
                    console.error("Could not remove socket:", unlinkErr.message);
                }
            }

            if (err.code === "ENOENT") {
                console.log("Socket directory not found");
                console.log("Spawn work dir:", spawnWorkDir);
                console.log("Trying to create directory...");
                try {
                    fs.mkdirSync(spawnWorkDir, { recursive: true });
                    console.log("Directory created, retrying listen...");
                    server.listen(socketPath, () => {
                        console.log("✓ Server listening on socket after mkdir");
                        notifyPassengerReady();
                    });
                } catch (mkdirErr) {
                    console.error("Could not create directory:", mkdirErr.message);
                }
            }
        });

    } else {
        console.log("No PASSENGER_SPAWN_WORK_DIR - exporting app");
        initializeWebSocket(server);
        module.exports = app;
    }

} else {
    // ----------------------------------------
    // Local Development
    // ----------------------------------------
    const PORT = process.env.PORT || 3000;

    initializeWebSocket(server);

    server.listen(PORT, () => {
        console.log(`✓ Server Started on port ${PORT}`);
        console.log(`HTTP:      http://localhost:${PORT}`);
        console.log(`WebSocket: ws://localhost:${PORT}/ws`);
    });

    module.exports = server;
}