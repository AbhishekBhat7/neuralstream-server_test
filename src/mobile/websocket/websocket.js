// const WebSocket = require("ws");
// const websocketController = require("../controllers/websocketController");

// module.exports = function initialize(server) {

//     const wss = new WebSocket.Server({
//         server,
//         path: "/ws",
//         maxPayload: 5 * 1024 * 1024,
//         perMessageDeflate: false
//     });

//     console.log("WebSocket Server Started");

//     //-------------------------------------------------------
//     // Heartbeat
//     //-------------------------------------------------------
//     const heartbeat = setInterval(() => {

//         wss.clients.forEach((ws) => {

//             if (ws.isAlive === false) {
//                 console.log(`Terminating stale socket: ${ws._ip || "unknown"}`);
//                 return ws.terminate();
//             }

//             ws.isAlive = false;
//             ws.ping();

//         });

//     }, 60000);

//     //-------------------------------------------------------
//     // Connection
//     //-------------------------------------------------------
//     wss.on("connection", (ws, request) => {

//         // Get IP
//         const ip =
//             request.headers["x-forwarded-for"] ||
//             request.socket.remoteAddress ||
//             "unknown";

//         // Store IP on socket for later logging
//         ws._ip = ip;

//         console.log(`WebSocket Connected: ${ip}`);
//         console.log(`Total clients: ${wss.clients.size}`);

//         // ----------------------------------------
//         // Set isAlive FIRST before anything else
//         // ----------------------------------------
//         ws.isAlive = true;

//         // ----------------------------------------
//         // Pong handler - reset alive status
//         // ----------------------------------------
//         ws.on("pong", () => {
//             ws.isAlive = true;
//             console.log(`Pong received from: ${ip}`);
//         });

//         // ----------------------------------------
//         // Error handler per connection
//         // ----------------------------------------
//         ws.on("error", (err) => {
//             console.error(`WebSocket Client Error [${ip}]:`, err.message);
//         });

//         // ----------------------------------------
//         // Close handler per connection
//         // ----------------------------------------
//         ws.on("close", (code, reason) => {
//             console.log(`WebSocket Disconnected: ${ip}`);
//             console.log(`Close code: ${code}`);
//             console.log(`Close reason: ${reason || "no reason given"}`);
//             console.log(`Remaining clients: ${wss.clients.size}`);
//         });

//         // ----------------------------------------
//         // Hand off to controller AFTER setup
//         // ----------------------------------------
//         try {
//             websocketController.handleConnection(ws, request);
//         } catch (err) {
//             console.error(`Controller error for ${ip}:`, err.message);
//             ws.close(1011, "Internal server error");
//         }

//     });

//     //-------------------------------------------------------
//     // Server level errors
//     //-------------------------------------------------------
//     wss.on("error", (err) => {
//         console.error("WebSocket Server Error:", err.message);
//     });

//     //-------------------------------------------------------
//     // Shutdown - cleanup heartbeat
//     //-------------------------------------------------------
//     wss.on("close", () => {
//         clearInterval(heartbeat);
//         console.log("WebSocket Server Closed");
//     });

//     //-------------------------------------------------------
//     // Graceful shutdown on process exit
//     //-------------------------------------------------------
//     process.on("SIGTERM", () => {
//         console.log("SIGTERM received - closing WebSocket server");
//         clearInterval(heartbeat);
//         wss.clients.forEach((ws) => {
//             ws.close(1001, "Server shutting down");
//         });
//         wss.close(() => {
//             console.log("WebSocket server closed gracefully");
//         });
//     });

//     process.on("SIGINT", () => {
//         console.log("SIGINT received - closing WebSocket server");
//         clearInterval(heartbeat);
//         wss.clients.forEach((ws) => {
//             ws.close(1001, "Server shutting down");
//         });
//         wss.close(() => {
//             console.log("WebSocket server closed gracefully");
//         });
//     });

//     return wss;
// };



const WebSocket = require("ws");
const websocketController = require("../controllers/websocketController");

module.exports = function initialize(server) {

    const wss = new WebSocket.Server({
        server,
        path: "/ws",
        maxPayload: 5 * 1024 * 1024,
        perMessageDeflate: false
    });

    console.log("WebSocket Server Started");

    //-------------------------------------------------------
    // Heartbeat - runs every 60 seconds
    //-------------------------------------------------------
    const heartbeat = setInterval(() => {
        console.log(`Heartbeat - Active clients: ${wss.clients.size}`);

        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                console.log(`Terminating stale socket: ${ws._ip}`);
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });

    }, 60000);

    //-------------------------------------------------------
    // New Connection
    //-------------------------------------------------------
    wss.on("connection", (ws, request) => {

        const ip =
            request.headers["x-forwarded-for"] ||
            request.socket.remoteAddress ||
            "unknown";

        ws._ip = ip;

        console.log(`WebSocket Connected: ${ip}`);
        console.log(`Total clients: ${wss.clients.size}`);

        // ----------------------------------------
        // Set isAlive HERE ONLY - not in controller
        // ----------------------------------------
        ws.isAlive = true;

        // ----------------------------------------
        // Pong handler HERE ONLY - not in controller
        // ----------------------------------------
        ws.on("pong", () => {
            ws.isAlive = true;
            console.log(`Pong from: ${ip}`);
        });

        // ----------------------------------------
        // Per connection close log
        // ----------------------------------------
        ws.on("close", (code, reason) => {
            console.log(`WebSocket Disconnected: ${ip}`);
            console.log(`Close code: ${code}`);
            console.log(`Close reason: ${reason?.toString() || "none"}`);
            console.log(`Remaining clients: ${wss.clients.size}`);
        });

        // ----------------------------------------
        // Per connection error log
        // ----------------------------------------
        ws.on("error", (err) => {
            console.error(`Client Error [${ip}]:`, err.message);
        });

        // ----------------------------------------
        // Hand off to controller
        // ----------------------------------------
        try {
            websocketController.handleConnection(ws, request);
        } catch (err) {
            console.error(`Controller error [${ip}]:`, err.message);
            console.error(err.stack);
            ws.close(1011, "Internal server error");
        }
    });

    //-------------------------------------------------------
    // Server Errors
    //-------------------------------------------------------
    wss.on("error", (err) => {
        console.error("WebSocket Server Error:", err.message);
    });

    //-------------------------------------------------------
    // Cleanup on shutdown
    //-------------------------------------------------------
    wss.on("close", () => {
        clearInterval(heartbeat);
        console.log("WebSocket Server Closed");
    });

    process.on("SIGTERM", () => {
        clearInterval(heartbeat);
        wss.clients.forEach((ws) => ws.close(1001, "Server shutting down"));
        wss.close();
    });

    return wss;
};