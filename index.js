// require("dotenv").config();

// const express = require("express");
// const http = require("http");
// const path = require("path");
// const fs = require("fs");

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
//     // Passenger Environment (A2 Hosting)
//     // ----------------------------------------
//     console.log("Running under Passenger");

//     const spawnWorkDir = process.env.PASSENGER_SPAWN_WORK_DIR;

//     if (spawnWorkDir) {
//         const socketPath = path.join(spawnWorkDir, "stdin.socket");

//         console.log("Socket Path:", socketPath);

//         // Attach WebSocket BEFORE listen
//         initializeWebSocket(server);

//         // Listen on Unix socket
//         server.listen(socketPath, () => {
//             console.log("✓ Server ready and listening");
//         });

//         // Handle server errors
//         server.on("error", (err) => {
//             console.error("Server error:", err.code, err.message);

//             // Socket already in use - remove and retry
//             if (err.code === "EADDRINUSE") {
//                 console.log("Socket in use, removing and retrying...");
//                 try {
//                     fs.unlinkSync(socketPath);
//                     server.listen(socketPath, () => {
//                         console.log("✓ Server ready after socket cleanup");
//                     });
//                 } catch (unlinkErr) {
//                     console.error("Could not remove socket:", unlinkErr.message);
//                 }
//             }

//             // Directory not found - try to create it
//             if (err.code === "ENOENT") {
//                 console.log("Socket directory not found, creating...");
//                 try {
//                     fs.mkdirSync(spawnWorkDir, { recursive: true });
//                     server.listen(socketPath, () => {
//                         console.log("✓ Server ready after mkdir");
//                     });
//                 } catch (mkdirErr) {
//                     console.error("Could not create directory:", mkdirErr.message);
//                 }
//             }
//         });

//     } else {
//         // Fallback if no spawn work dir
//         console.log("No PASSENGER_SPAWN_WORK_DIR found - using app export");
//         initializeWebSocket(server);
//         module.exports = app;
//     }

// } else {
//     // ----------------------------------------
//     // Local Development
//     // ----------------------------------------
//     const PORT = process.env.PORT || 3000;

//     initializeWebSocket(server);

//     server.listen(PORT, () => {
//         console.log(`✓ Server Started on port ${PORT}`);
//         console.log(`   HTTP:      http://localhost:${PORT}`);
//         console.log(`   WebSocket: ws://localhost:${PORT}/ws`);
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
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({
        error: err.message,
        path: req.path
    });
});

// ============================================
// CREATE SERVERS
// ============================================
const httpServer = http.createServer(app);
const wsServer = http.createServer();

// ============================================
// START
// ============================================
if (process.env.PASSENGER_APP_ENV) {
    console.log("Running under Passenger");

    const spawnWorkDir = process.env.PASSENGER_SPAWN_WORK_DIR;
    const WS_PORT = parseInt(process.env.WS_PORT) || 3001;

    // ----------------------------------------
    // WebSocket on separate port
    // Bypasses Apache completely
    // ----------------------------------------
    initializeWebSocket(wsServer);

    wsServer.listen(WS_PORT, "0.0.0.0", () => {
        console.log(`✓ WebSocket listening on port ${WS_PORT}`);
        console.log(`  Connect via: wss://neuralstream.server.nimvoltlabs.in:${WS_PORT}/ws`);
    });

    wsServer.on("error", (err) => {
        console.error("WebSocket server error:", err.code, err.message);
        
        // Try next port if in use
        if (err.code === "EADDRINUSE") {
            const nextPort = WS_PORT + 1;
            console.log(`Port ${WS_PORT} in use, trying ${nextPort}`);
            wsServer.listen(nextPort, "0.0.0.0", () => {
                console.log(`✓ WebSocket listening on fallback port ${nextPort}`);
            });
        }
    });

    // ----------------------------------------
    // HTTP on Passenger socket
    // ----------------------------------------
    if (spawnWorkDir) {
        const socketPath = path.join(spawnWorkDir, "stdin.socket");
        console.log("Socket Path:", socketPath);

        httpServer.listen(socketPath, () => {
            console.log("✓ HTTP Server ready on Passenger socket");
        });

        httpServer.on("error", (err) => {
            console.error("HTTP server error:", err.code, err.message);

            if (err.code === "EADDRINUSE") {
                try {
                    fs.unlinkSync(socketPath);
                    httpServer.listen(socketPath, () => {
                        console.log("✓ HTTP Server ready after cleanup");
                    });
                } catch (e) {
                    console.error("Socket cleanup error:", e.message);
                }
            }
        });

    } else {
        console.log("No PASSENGER_SPAWN_WORK_DIR - exporting app");
        module.exports = app;
    }

} else {
    // ----------------------------------------
    // Local Development - single server
    // ----------------------------------------
    const PORT = process.env.PORT || 3000;

    initializeWebSocket(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`✓ Server on port ${PORT}`);
        console.log(`  HTTP:      http://localhost:${PORT}`);
        console.log(`  WebSocket: ws://localhost:${PORT}/ws`);
    });

    module.exports = httpServer;
}