// const WebSocket = require("ws");

// const websocketController = require("../controllers/websocketController");

// module.exports = function initialize(server) {

//     const wss = new WebSocket.Server({

//         server,

//         path: "/ws"

//     });

//     wss.on("connection", (ws, request) => {

//         console.log("Client Connected");

//         websocketController.handleConnection(ws);

//     });

// };

// const WebSocket = require("ws");

// const websocketController = require("../controllers/websocketController");

// module.exports = function initialize(server) {

//     const wss = new WebSocket.Server({

//         server,

//         path: "/ws",

//         // Maximum incoming message size (5 MB)
//         maxPayload: 5 * 1024 * 1024,

//         // Disable compression for binary telemetry
//         perMessageDeflate: false

//     });

//     console.log("WebSocket Server Started");

//     //-------------------------------------------------------
//     // Heartbeat
//     //-------------------------------------------------------

//     const heartbeat = setInterval(() => {

//         wss.clients.forEach((ws) => {

//             if (ws.isAlive === false) {

//                 console.log("Terminating stale socket");

//                 return ws.terminate();

//             }

//             ws.isAlive = false;

//             ws.ping();

//         });

//     }, 30000);

//     //-------------------------------------------------------
//     // Connection
//     //-------------------------------------------------------

//     wss.on("connection", (ws, request) => {

//         console.log(

//             `WebSocket Connected : ${request.socket.remoteAddress}`

//         );

//         ws.isAlive = true;

//         websocketController.handleConnection(ws);

//     });

//     //-------------------------------------------------------
//     // Errors
//     //-------------------------------------------------------

//     wss.on("error", (err) => {

//         console.error(

//             "WebSocket Server Error:",

//             err.message

//         );

//     });

//     //-------------------------------------------------------
//     // Shutdown
//     //-------------------------------------------------------

//     wss.on("close", () => {

//         clearInterval(heartbeat);

//         console.log("WebSocket Server Closed");

//     });

//     return wss;

// };



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
//     // Heartbeat - Fixed timing issue
//     //-------------------------------------------------------
//     const heartbeat = setInterval(() => {

//         wss.clients.forEach((ws) => {

//             if (ws.isAlive === false) {
//                 console.log("Terminating stale socket");
//                 return ws.terminate();
//             }

//             ws.isAlive = false;
//             ws.ping();

//         });

//     }, 60000); // ← Increased from 30s to 60s

//     //-------------------------------------------------------
//     // Connection
//     //-------------------------------------------------------
//     wss.on("connection", (ws, request) => {

//         const ip = 
//             request.headers["x-forwarded-for"] || 
//             request.socket.remoteAddress ||
//             "unknown";

//         console.log(`WebSocket Connected: ${ip}`);

//         // Set isAlive true on connection
//         ws.isAlive = true;

//         // Reset isAlive on pong response
//         ws.on("pong", () => {
//             ws.isAlive = true;
//             console.log(`Pong received from: ${ip}`);
//         });

//         // Reset isAlive on any message too
//         ws.on("message", (data) => {
//             ws.isAlive = true;
//         });

//         websocketController.handleConnection(ws);

//     });

//     //-------------------------------------------------------
//     // Errors
//     //-------------------------------------------------------
//     wss.on("error", (err) => {
//         console.error("WebSocket Server Error:", err.message);
//     });

//     //-------------------------------------------------------
//     // Shutdown
//     //-------------------------------------------------------
//     wss.on("close", () => {
//         clearInterval(heartbeat);
//         console.log("WebSocket Server Closed");
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
    // Heartbeat
    //-------------------------------------------------------
    const heartbeat = setInterval(() => {

        wss.clients.forEach((ws) => {

            if (ws.isAlive === false) {
                console.log(`Terminating stale socket: ${ws._ip || "unknown"}`);
                return ws.terminate();
            }

            ws.isAlive = false;
            ws.ping();

        });

    }, 60000);

    //-------------------------------------------------------
    // Connection
    //-------------------------------------------------------
    wss.on("connection", (ws, request) => {

        // Get IP
        const ip =
            request.headers["x-forwarded-for"] ||
            request.socket.remoteAddress ||
            "unknown";

        // Store IP on socket for later logging
        ws._ip = ip;

        console.log(`WebSocket Connected: ${ip}`);
        console.log(`Total clients: ${wss.clients.size}`);

        // ----------------------------------------
        // Set isAlive FIRST before anything else
        // ----------------------------------------
        ws.isAlive = true;

        // ----------------------------------------
        // Pong handler - reset alive status
        // ----------------------------------------
        ws.on("pong", () => {
            ws.isAlive = true;
            console.log(`Pong received from: ${ip}`);
        });

        // ----------------------------------------
        // Error handler per connection
        // ----------------------------------------
        ws.on("error", (err) => {
            console.error(`WebSocket Client Error [${ip}]:`, err.message);
        });

        // ----------------------------------------
        // Close handler per connection
        // ----------------------------------------
        ws.on("close", (code, reason) => {
            console.log(`WebSocket Disconnected: ${ip}`);
            console.log(`Close code: ${code}`);
            console.log(`Close reason: ${reason || "no reason given"}`);
            console.log(`Remaining clients: ${wss.clients.size}`);
        });

        // ----------------------------------------
        // Hand off to controller AFTER setup
        // ----------------------------------------
        try {
            websocketController.handleConnection(ws, request);
        } catch (err) {
            console.error(`Controller error for ${ip}:`, err.message);
            ws.close(1011, "Internal server error");
        }

    });

    //-------------------------------------------------------
    // Server level errors
    //-------------------------------------------------------
    wss.on("error", (err) => {
        console.error("WebSocket Server Error:", err.message);
    });

    //-------------------------------------------------------
    // Shutdown - cleanup heartbeat
    //-------------------------------------------------------
    wss.on("close", () => {
        clearInterval(heartbeat);
        console.log("WebSocket Server Closed");
    });

    //-------------------------------------------------------
    // Graceful shutdown on process exit
    //-------------------------------------------------------
    process.on("SIGTERM", () => {
        console.log("SIGTERM received - closing WebSocket server");
        clearInterval(heartbeat);
        wss.clients.forEach((ws) => {
            ws.close(1001, "Server shutting down");
        });
        wss.close(() => {
            console.log("WebSocket server closed gracefully");
        });
    });

    process.on("SIGINT", () => {
        console.log("SIGINT received - closing WebSocket server");
        clearInterval(heartbeat);
        wss.clients.forEach((ws) => {
            ws.close(1001, "Server shutting down");
        });
        wss.close(() => {
            console.log("WebSocket server closed gracefully");
        });
    });

    return wss;
};






// const WebSocket = require("ws");
// const websocketController = require("../controllers/websocketController");

// module.exports = function initialize(server) {

//     // Attach to the SAME server passed in from index.js
//     const wss = new WebSocket.Server({
//         server,           // ← Shares port with Express
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
//                 console.log("Terminating stale socket");
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

//         const ip =
//             request.headers["x-forwarded-for"] ||
//             request.socket.remoteAddress ||
//             "unknown";

//         console.log(`WebSocket Connected: ${ip}`);

//         ws.isAlive = true;

//         ws.on("pong", () => {
//             ws.isAlive = true;
//             console.log(`Pong received from: ${ip}`);
//         });

//         ws.on("message", (data) => {
//             ws.isAlive = true;
//             // Pass to controller
//             try {
//                 websocketController.handleConnection(ws, data);
//             } catch (e) {
//                 console.error("Message handler error:", e.message);
//             }
//         });

//         ws.on("close", () => {
//             console.log(`WebSocket Disconnected: ${ip}`);
//         });

//         ws.on("error", (err) => {
//             console.error(`WebSocket Error (${ip}):`, err.message);
//         });

//         websocketController.handleConnection(ws);

//     });

//     //-------------------------------------------------------
//     // Server errors
//     //-------------------------------------------------------
//     wss.on("error", (err) => {
//         console.error("WebSocket Server Error:", err.message);
//     });

//     //-------------------------------------------------------
//     // Cleanup on shutdown
//     //-------------------------------------------------------
//     wss.on("close", () => {
//         clearInterval(heartbeat);
//         console.log("WebSocket Server Closed");
//     });

//     // Cleanup heartbeat if process exits
//     process.on("exit", () => {
//         clearInterval(heartbeat);
//     });

//     return wss;
// };