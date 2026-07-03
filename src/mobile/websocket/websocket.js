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

    // Attach to the SAME server passed in from index.js
    const wss = new WebSocket.Server({
        server,           // ← Shares port with Express
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
                console.log("Terminating stale socket");
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

        const ip =
            request.headers["x-forwarded-for"] ||
            request.socket.remoteAddress ||
            "unknown";

        console.log(`WebSocket Connected: ${ip}`);

        ws.isAlive = true;

        ws.on("pong", () => {
            ws.isAlive = true;
            console.log(`Pong received from: ${ip}`);
        });

        ws.on("message", (data) => {
            ws.isAlive = true;
            // Pass to controller
            try {
                websocketController.handleMessage(ws, data);
            } catch (e) {
                console.error("Message handler error:", e.message);
            }
        });

        ws.on("close", () => {
            console.log(`WebSocket Disconnected: ${ip}`);
        });

        ws.on("error", (err) => {
            console.error(`WebSocket Error (${ip}):`, err.message);
        });

        websocketController.handleConnection(ws);

    });

    //-------------------------------------------------------
    // Server errors
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

    // Cleanup heartbeat if process exits
    process.on("exit", () => {
        clearInterval(heartbeat);
    });

    return wss;
};