const manager = require("../websocket/sessionManager");
const websocketService = require("../services/websocketService");
const sessionService = require("../services/sessionService");

const { verifyToken } = require("../utils/authJwt");

async function handleConnection(ws) {

    // -----------------------------
    // Socket State
    // -----------------------------

    ws.isAuthenticated = false;
    ws.user = null;
    ws.role = null;
    ws.sessionId = null;
    ws.deviceId = null;
    ws.isAlive = true;

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    // -----------------------------
    // Incoming Messages
    // -----------------------------

    ws.on("message", async (data, isBinary) => {

        try {

            //---------------------------------------
            // Binary Telemetry
            //---------------------------------------

            if (isBinary) {

                if (
                    !ws.isAuthenticated ||
                    ws.role !== "host" ||
                    !ws.sessionId
                ) {
                    return;
                }

                websocketService.broadcastBinary(
                    ws.sessionId,
                    data
                );

                return;
            }

            //---------------------------------------
            // Parse JSON
            //---------------------------------------

            let message;

            try {

                message = JSON.parse(
                    data.toString()
                );

            } catch {

                ws.send(JSON.stringify({
                    type: "error",
                    message: "Invalid JSON"
                }));

                return;
            }

            //---------------------------------------
            // Authentication
            //---------------------------------------

            if (message.type === "auth") {

                if (ws.isAuthenticated) {

                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Already authenticated"
                    }));

                    return;
                }

                if (!message.token) {

                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Token missing"
                    }));

                    return;
                }

                const decoded = verifyToken(
                    message.token
                );

                if (!decoded) {

                    ws.send(JSON.stringify({
                        type: "auth_failed"
                    }));

                    ws.close();

                    return;
                }

                ws.isAuthenticated = true;
                ws.user = decoded;

                ws.send(JSON.stringify({

                    type: "auth_success",

                    userId: decoded.userId

                }));

                return;
            }

            //---------------------------------------
            // Everything below requires auth
            //---------------------------------------

            if (!ws.isAuthenticated) {

                ws.send(JSON.stringify({

                    type: "error",

                    message: "Authenticate first"

                }));

                return;
            }

            //---------------------------------------
            // Host Join
            //---------------------------------------

            if (message.type === "host") {

                if (
                    !message.sessionId
                ) {

                    ws.send(JSON.stringify({

                        type: "error",

                        message: "sessionId required"

                    }));

                    return;
                }

                const isValid =
                    await sessionService.validateHost(

                        message.sessionId,

                        ws.user.userId

                    );

                if (!isValid) {

                    ws.send(JSON.stringify({

                        type: "error",

                        message:
                            "Unauthorized host"

                    }));

                    ws.close();

                    return;
                }

                ws.role = "host";
                ws.sessionId = message.sessionId;

                manager.setHost(

                    message.sessionId,

                    ws

                );

                ws.send(JSON.stringify({

                    type: "host_joined",

                    sessionId: message.sessionId

                }));

                console.log(

                    `[HOST CONNECTED] User ${ws.user.userId}`

                );

                return;

            }

            //---------------------------------------
            // Viewer Join
            //---------------------------------------

            if (message.type === "viewer") {

                if (
                    !message.sessionId ||
                    !message.deviceId
                ) {

                    ws.send(JSON.stringify({

                        type: "error",

                        message:
                            "sessionId & deviceId required"

                    }));

                    return;
                }

                try {

                    await sessionService.joinSession(

                        message.sessionId,

                        ws.user.userId,

                        message.deviceId

                    );

                } catch (err) {

                    ws.send(JSON.stringify({

                        type: "error",

                        message: err.message

                    }));

                    return;

                }

                ws.role = "viewer";
                ws.sessionId = message.sessionId;
                ws.deviceId = message.deviceId;

                manager.addViewer(

                    message.sessionId,

                    ws

                );

                ws.send(JSON.stringify({

                    type: "viewer_joined",

                    sessionId: message.sessionId

                }));

                console.log(

                    `[VIEWER CONNECTED] User ${ws.user.userId}`

                );

                return;

            }

            //---------------------------------------
            // Unknown Message
            //---------------------------------------

            ws.send(JSON.stringify({

                type: "error",

                message: "Unknown message type"

            }));

        } catch (err) {

            console.error(err);

            ws.send(JSON.stringify({

                type: "error",

                message: "Internal Server Error"

            }));

        }

    });

    // -----------------------------
    // Disconnect
    // -----------------------------

    ws.on("close", async () => {

        try {

            if (

                ws.role === "viewer" &&

                ws.sessionId &&

                ws.deviceId

            ) {

                await sessionService.leaveSession(

                    ws.sessionId,

                    ws.user.userId,

                    ws.deviceId

                );

            }

            if (

                ws.role === "host" &&

                ws.sessionId

            ) {

                try {

                    await sessionService.endSession(

                        ws.sessionId,

                        ws.user.userId

                    );

                } catch (_) {}

            }

            manager.removeClient(ws);

            console.log(

                `[DISCONNECTED] ${ws.user?.userId || "Unknown"}`

            );

        } catch (err) {

            console.error(err);

        }

    });

    // -----------------------------
    // Errors
    // -----------------------------

    ws.on("error", (err) => {

        console.error(

            "WebSocket Error:",

            err.message

        );

    });

}

module.exports = {

    handleConnection

};controller code

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
service code
const sessions = new Map();

/**
 * Create session if not exists.
 */
function createSession(sessionId) {

    if (!sessions.has(sessionId)) {

        sessions.set(sessionId, {

            host: null,

            viewers: new Set()

        });

    }

    return sessions.get(sessionId);

}

/**
 * Set host.
 * If another host already exists,
 * disconnect the previous one.
 */
function setHost(sessionId, ws) {

    const session = createSession(sessionId);

    if (

        session.host &&

        session.host !== ws

    ) {

        try {

            session.host.close(
                4000,
                "Another host connected"
            );

        } catch (_) {}

    }

    session.host = ws;

}

/**
 * Get host socket.
 */
function getHost(sessionId) {

    const session = sessions.get(sessionId);

    if (!session) {
        return null;
    }

    return session.host;

}

/**
 * Add viewer.
 */
function addViewer(sessionId, ws) {

    const session = createSession(sessionId);

    session.viewers.add(ws);

}

/**
 * Remove viewer.
 */
function removeViewer(sessionId, ws) {

    const session = sessions.get(sessionId);

    if (!session) {
        return;
    }

    session.viewers.delete(ws);

    cleanup(sessionId);

}

/**
 * Remove host.
 */
function removeHost(sessionId) {

    const session = sessions.get(sessionId);

    if (!session) {
        return;
    }

    session.host = null;

    cleanup(sessionId);

}

/**
 * Remove client.
 */
function removeClient(ws) {

    for (const [sessionId, session] of sessions.entries()) {

        if (session.host === ws) {

            session.host = null;

        }

        session.viewers.delete(ws);

        cleanup(sessionId);

    }

}

/**
 * Remove empty session.
 */
function cleanup(sessionId) {

    const session = sessions.get(sessionId);

    if (!session) {
        return;
    }

    if (

        !session.host &&

        session.viewers.size === 0

    ) {

        sessions.delete(sessionId);

    }

}

/**
 * Get session.
 */
function getSession(sessionId) {

    return sessions.get(sessionId);

}

/**
 * Session exists.
 */
function hasSession(sessionId) {

    return sessions.has(sessionId);

}

/**
 * Viewer count.
 */
function getViewerCount(sessionId) {

    const session = sessions.get(sessionId);

    if (!session) {

        return 0;

    }

    return session.viewers.size;

}

/**
 * Get all viewers.
 */
function getViewers(sessionId) {

    const session = sessions.get(sessionId);

    if (!session) {

        return [];

    }

    return [...session.viewers];

}

/**
 * Total active sessions.
 */
function getSessionCount() {

    return sessions.size;

}

/**
 * Clear all sessions.
 */
function clear() {

    sessions.clear();

}

module.exports = {

    createSession,

    setHost,

    getHost,

    addViewer,

    removeViewer,

    removeHost,

    removeClient,

    getSession,

    getViewers,

    getViewerCount,

    getSessionCount,

    hasSession,

    clear

};
session manager code 