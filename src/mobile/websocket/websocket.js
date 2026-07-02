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

const WebSocket = require("ws");

const websocketController = require("../controllers/websocketController");

module.exports = function initialize(server) {

    const wss = new WebSocket.Server({

        server,

        path: "/ws",

        // Maximum incoming message size (5 MB)
        maxPayload: 5 * 1024 * 1024,

        // Disable compression for binary telemetry
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

    }, 30000);

    //-------------------------------------------------------
    // Connection
    //-------------------------------------------------------

    wss.on("connection", (ws, request) => {

        console.log(

            `WebSocket Connected : ${request.socket.remoteAddress}`

        );

        ws.isAlive = true;

        websocketController.handleConnection(ws);

    });

    //-------------------------------------------------------
    // Errors
    //-------------------------------------------------------

    wss.on("error", (err) => {

        console.error(

            "WebSocket Server Error:",

            err.message

        );

    });

    //-------------------------------------------------------
    // Shutdown
    //-------------------------------------------------------

    wss.on("close", () => {

        clearInterval(heartbeat);

        console.log("WebSocket Server Closed");

    });

    return wss;

};