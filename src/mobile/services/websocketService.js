// const manager = require("../websocket/sessionManager");

// function broadcastBinary(sessionId, buffer) {

//     const session = manager.getSession(sessionId);

//     if (!session) return;

//     session.viewers.forEach(client => {

//         if (client.readyState === 1) {

//             client.send(buffer, {

//                 binary: true

//             });

//         }

//     });

// }

// module.exports = {

//     broadcastBinary

// };

const WebSocket = require("ws");
const manager = require("../websocket/sessionManager");

/**
 * Broadcast binary telemetry from host
 * to all connected viewers.
 */
const broadcastBinary = (
    sessionId,
    buffer
) => {

    const session = manager.getSession(
        sessionId
    );

    if (!session) {
        return;
    }

    for (const viewer of session.viewers) {

        //-------------------------------------
        // Skip invalid sockets
        //-------------------------------------

        if (
            viewer.readyState !== WebSocket.OPEN
        ) {

            manager.removeClient(viewer);

            continue;

        }

        //-------------------------------------
        // Backpressure protection
        //-------------------------------------

        // Skip slow clients.
        // Prevents memory growth.

        if (
            viewer.bufferedAmount >
            1024 * 1024
        ) {
            continue;
        }

        //-------------------------------------
        // Send telemetry
        //-------------------------------------

        try {

            viewer.send(
                buffer,
                {
                    binary: true
                }
            );

        } catch (err) {

            console.error(
                "Broadcast Error:",
                err.message
            );

            manager.removeClient(viewer);

            try {
                viewer.close();
            } catch (_) {}

        }

    }

};

/**
 * Send JSON message
 * to a single socket.
 */
const sendMessage = (
    ws,
    type,
    payload = {}
) => {

    if (
        ws.readyState !==
        WebSocket.OPEN
    ) {
        return;
    }

    try {

        ws.send(
            JSON.stringify({

                type,

                ...payload

            })
        );

    } catch (err) {

        console.error(
            err.message
        );

    }

};

/**
 * Broadcast JSON message
 * to every viewer.
 */
const broadcastMessage = (
    sessionId,
    type,
    payload = {}
) => {

    const session =
        manager.getSession(sessionId);

    if (!session) {
        return;
    }

    for (const viewer of session.viewers) {

        sendMessage(
            viewer,
            type,
            payload
        );

    }

};

/**
 * Notify all viewers that
 * the session has ended.
 */
const notifySessionEnded = (
    sessionId
) => {

    broadcastMessage(

        sessionId,

        "session_ended"

    );

};

module.exports = {

    broadcastBinary,

    sendMessage,

    broadcastMessage,

    notifySessionEnded

};