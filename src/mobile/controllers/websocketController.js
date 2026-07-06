// const manager = require("../websocket/sessionManager");

// const service = require("../services/websocketService");

// const { verifyToken } = require("../utils/authJwt");

// function handleConnection(ws) {

//     ws.authenticated = false;

//     ws.user = null;

//     ws.on("message", (data, isBinary) => {

//         //---------------------------------------
//         // Binary telemetry
//         //---------------------------------------

//         if (isBinary) {

//             if (!ws.authenticated)
//                 return;

//             if (!ws.sessionId)
//                 return;

//             if (ws.role !== "host")
//                 return;

//             service.broadcastBinary(

//                 ws.sessionId,

//                 data

//             );

//             return;
//         }

//         //---------------------------------------
//         // JSON messages
//         //---------------------------------------

//         let message;

//         try {

//             message = JSON.parse(
//                 data.toString()
//             );

//         } catch {

//             ws.close();

//             return;
//         }

//         switch (message.type) {

//             //-----------------------------------
//             // Authenticate
//             //-----------------------------------

//             case "auth":

//                 const decoded = verifyToken(
//                     message.token
//                 );

//                 if (!decoded) {

//                     ws.send(JSON.stringify({

//                         type: "auth_failed"

//                     }));

//                     ws.close();

//                     return;
//                 }

//                 ws.authenticated = true;

//                 ws.user = decoded;

//                 ws.send(JSON.stringify({

//                     type: "auth_success"

//                 }));

//                 break;

//             //-----------------------------------
//             // Host joins
//             //-----------------------------------

//             case "host":

//                 if (!ws.authenticated)
//                     return;

//                 ws.role = "host";

//                 ws.sessionId = message.sessionId;

//                 manager.setHost(

//                     message.sessionId,

//                     ws

//                 );

//                 console.log(
//                     `${ws.user.user_id} joined as HOST`
//                 );

//                 break;

//             //-----------------------------------
//             // Viewer joins
//             //-----------------------------------

//             case "viewer":

//                 if (!ws.authenticated)
//                     return;

//                 ws.role = "viewer";

//                 ws.sessionId = message.sessionId;

//                 manager.addViewer(

//                     message.sessionId,

//                     ws

//                 );

//                 console.log(
//                     `${ws.user.user_id} joined as VIEWER`
//                 );

//                 break;

//         }

//     });

//     ws.on("close", () => {

//         manager.removeClient(ws);

//     });

// }

// module.exports = {

//     handleConnection

// };


const manager = require("../websocket/sessionManager");
const websocketService = require("../services/websocketService");
const sessionService = require("../services/sessionService");

const { verifyToken } = require("../utils/authJwt");

// async function handleConnection(ws) {

//     // -----------------------------
//     // Socket State
//     // -----------------------------

//     ws.isAuthenticated = false;
//     ws.user = null;
//     ws.role = null;
//     ws.sessionId = null;
//     ws.deviceId = null;
//     ws.isAlive = true;

//     ws.on("pong", () => {
//         ws.isAlive = true;
//     });

//     // -----------------------------
//     // Incoming Messages
//     // -----------------------------

//     ws.on("message", async (data, isBinary) => {

//         try {

//             //---------------------------------------
//             // Binary Telemetry
//             //---------------------------------------

//             if (isBinary) {

//                 if (
//                     !ws.isAuthenticated ||
//                     ws.role !== "host" ||
//                     !ws.sessionId
//                 ) {
//                     return;
//                 }

//                 websocketService.broadcastBinary(
//                     ws.sessionId,
//                     data
//                 );

//                 return;
//             }

//             //---------------------------------------
//             // Parse JSON
//             //---------------------------------------

//             let message;

//             try {

//                 message = JSON.parse(
//                     data.toString()
//                 );

//             } catch {

//                 ws.send(JSON.stringify({
//                     type: "error",
//                     message: "Invalid JSON"
//                 }));

//                 return;
//             }

//             //---------------------------------------
//             // Authentication
//             //---------------------------------------

//             if (message.type === "auth") {

//                 if (ws.isAuthenticated) {

//                     ws.send(JSON.stringify({
//                         type: "error",
//                         message: "Already authenticated"
//                     }));

//                     return;
//                 }

//                 if (!message.token) {

//                     ws.send(JSON.stringify({
//                         type: "error",
//                         message: "Token missing"
//                     }));

//                     return;
//                 }

//                 const decoded = verifyToken(
//                     message.token
//                 );

//                 if (!decoded) {

//                     ws.send(JSON.stringify({
//                         type: "auth_failed"
//                     }));

//                     ws.close();

//                     return;
//                 }

//                 ws.isAuthenticated = true;
//                 ws.user = decoded;

//                 ws.send(JSON.stringify({

//                     type: "auth_success",

//                     userId: decoded.userId

//                 }));

//                 return;
//             }

//             //---------------------------------------
//             // Everything below requires auth
//             //---------------------------------------

//             if (!ws.isAuthenticated) {

//                 ws.send(JSON.stringify({

//                     type: "error",

//                     message: "Authenticate first"

//                 }));

//                 return;
//             }

//             //---------------------------------------
//             // Host Join
//             //---------------------------------------

//             if (message.type === "host") {

//                 if (
//                     !message.sessionId
//                 ) {

//                     ws.send(JSON.stringify({

//                         type: "error",

//                         message: "sessionId required"

//                     }));

//                     return;
//                 }

//                 const isValid =
//                     await sessionService.validateHost(

//                         message.sessionId,

//                         ws.user.userId

//                     );

//                 if (!isValid) {

//                     ws.send(JSON.stringify({

//                         type: "error",

//                         message:
//                             "Unauthorized host"

//                     }));

//                     ws.close();

//                     return;
//                 }

//                 ws.role = "host";
//                 ws.sessionId = message.sessionId;

//                 manager.setHost(

//                     message.sessionId,

//                     ws

//                 );

//                 ws.send(JSON.stringify({

//                     type: "host_joined",

//                     sessionId: message.sessionId

//                 }));

//                 console.log(

//                     `[HOST CONNECTED] User ${ws.user.userId}`

//                 );

//                 return;

//             }

//             //---------------------------------------
//             // Viewer Join
//             //---------------------------------------

//             if (message.type === "viewer") {

//                 if (
//                     !message.sessionId ||
//                     !message.deviceId
//                 ) {

//                     ws.send(JSON.stringify({

//                         type: "error",

//                         message:
//                             "sessionId & deviceId required"

//                     }));

//                     return;
//                 }

//                 try {
//                     console.log("deviceId:", deviceId);
//                     console.log("userId:", userId);
//                     console.log("JWT:", ws.user);
//                     console.log("Message Device:", message.deviceId);   
//                     await sessionService.joinSession(

//                         message.sessionId,

//                         ws.user.userId,

//                         message.deviceId

//                     );

//                 } catch (err) {

//                     ws.send(JSON.stringify({

//                         type: "error",

//                         message: err.message

//                     }));

//                     return;

//                 }

//                 ws.role = "viewer";
//                 ws.sessionId = message.sessionId;
//                 ws.deviceId = message.deviceId;

//                 manager.addViewer(

//                     message.sessionId,

//                     ws

//                 );

//                 ws.send(JSON.stringify({

//                     type: "viewer_joined",

//                     sessionId: message.sessionId

//                 }));

//                 console.log(

//                     `[VIEWER CONNECTED] User ${ws.user.userId}`

//                 );

//                 return;

//             }

//             //---------------------------------------
//             // Unknown Message
//             //---------------------------------------

//             ws.send(JSON.stringify({

//                 type: "error",

//                 message: "Unknown message type"

//             }));

//         } catch (err) {

//             console.error(err);

//             ws.send(JSON.stringify({

//                 type: "error",

//                 message: "Internal Server Error"

//             }));

//         }

//     });

//     // -----------------------------
//     // Disconnect
//     // -----------------------------

//     ws.on("close", async () => {

//         try {

//             if (

//                 ws.role === "viewer" &&

//                 ws.sessionId &&

//                 ws.deviceId

//             ) {

//                 await sessionService.leaveSession(

//                     ws.sessionId,

//                     ws.user.userId,

//                     ws.deviceId

//                 );

//             }

//             if (

//                 ws.role === "host" &&

//                 ws.sessionId

//             ) {

//                 try {

//                     await sessionService.endSession(

//                         ws.sessionId,

//                         ws.user.userId

//                     );

//                 } catch (_) {}

//             }

//             manager.removeClient(ws);

//             console.log(

//                 `[DISCONNECTED] ${ws.user?.userId || "Unknown"}`

//             );

//         } catch (err) {

//             console.error(err);

//         }

//     });

//     // -----------------------------
//     // Errors
//     // -----------------------------

//     ws.on("error", (err) => {

//         console.error(

//             "WebSocket Error:",

//             err.message

//         );

//     });

// }
async function handleConnection(ws) {

    // Give every socket a unique ID
    ws.id = crypto.randomUUID();

    console.log("==================================");
    console.log("NEW CONNECTION:", ws.id);
    console.log("==================================");

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

        console.log("\n----------------------------------");
        console.log("Socket:", ws.id);
        console.log("Received:", data.toString());
        console.log("Authenticated:", ws.isAuthenticated);
        console.log("----------------------------------");

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

                message = JSON.parse(data.toString());

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

                console.log("AUTH REQUEST");

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

                const decoded = verifyToken(message.token);

                console.log("Decoded:", decoded);

                if (!decoded) {

                    ws.send(JSON.stringify({
                        type: "auth_failed"
                    }));

                    ws.close();

                    return;
                }

                ws.isAuthenticated = true;
                ws.user = decoded;

                console.log("AUTH SUCCESS");
                console.log("Socket:", ws.id);
                console.log("Authenticated:", ws.isAuthenticated);
                console.log("User:", ws.user);

                ws.send(JSON.stringify({
                    type: "auth_success",
                    userId: decoded.userId
                }));

                return;
            }

            //---------------------------------------
            // Everything below requires auth
            //---------------------------------------

            console.log("Before auth check");
            console.log("Socket:", ws.id);
            console.log("Authenticated:", ws.isAuthenticated);
            console.log("Message:", message.type);

            if (!ws.isAuthenticated) {

                console.log("FAILED AUTH CHECK");

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

                console.log("HOST REQUEST");

                if (!message.sessionId) {

                    ws.send(JSON.stringify({
                        type: "error",
                        message: "sessionId required"
                    }));

                    return;
                }

                const isValid = await sessionService.validateHost(
                    message.sessionId,
                    ws.user.userId
                );

                console.log("Host validation:", isValid);

                if (!isValid) {

                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Unauthorized host"
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

                console.log("[HOST CONNECTED]", ws.user.userId);

                return;
            }

            //---------------------------------------
            // Viewer Join
            //---------------------------------------

            if (message.type === "viewer") {

                if (!message.sessionId || !message.deviceId) {

                    ws.send(JSON.stringify({
                        type: "error",
                        message: "sessionId & deviceId required"
                    }));

                    return;
                }

                console.log("Viewer:", message.deviceId);

                await sessionService.joinSession(
                    message.sessionId,
                    ws.user.userId,
                    message.deviceId
                );

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

                return;
            }

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

    ws.on("close", () => {
        console.log("Socket closed:", ws.id);
    });

    ws.on("error", (err) => {
        console.log("Socket error:", ws.id, err.message);
    });

}

module.exports = {

    handleConnection

};