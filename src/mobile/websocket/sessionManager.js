// // const sessions = new Map();

// // function createSession(sessionId) {

// //     if (!sessions.has(sessionId)) {

// //         sessions.set(sessionId, {

// //             host: null,

// //             viewers: new Set()

// //         });

// //     }

// //     return sessions.get(sessionId);

// // }

// // function setHost(sessionId, ws) {

// //     const session = createSession(sessionId);

// //     session.host = ws;

// // }

// // function addViewer(sessionId, ws) {

// //     const session = createSession(sessionId);

// //     session.viewers.add(ws);

// // }

// // function removeClient(ws) {

// //     for (const [sessionId, session] of sessions.entries()) {

// //         if (session.host === ws) {

// //             session.host = null;

// //         }

// //         session.viewers.delete(ws);

// //         if (!session.host && session.viewers.size === 0) {

// //             sessions.delete(sessionId);

// //         }

// //     }

// // }

// // function getSession(sessionId) {
// //     return sessions.get(sessionId);
// // }

// // module.exports = {
// //     setHost,
// //     addViewer,
// //     removeClient,
// //     getSession
// // };


// const sessions = new Map();

// function createSession(sessionId) {

//     if (!sessions.has(sessionId)) {

//         sessions.set(sessionId, {
//             host: null,
//             viewers: new Set()
//         });

//     }

//     return sessions.get(sessionId);
// }

// function setHost(sessionId, ws) {

//     const session = createSession(sessionId);

//     session.host = ws;
// }

// function addViewer(sessionId, ws) {

//     const session = createSession(sessionId);

//     session.viewers.add(ws);
// }

// function getSession(sessionId) {

//     return sessions.get(sessionId);
// }

// function removeClient(ws) {

//     for (const [id, session] of sessions.entries()) {

//         if (session.host === ws)
//             session.host = null;

//         session.viewers.delete(ws);

//         if (
//             !session.host &&
//             session.viewers.size === 0
//         ) {
//             sessions.delete(id);
//         }
//     }
// }

// module.exports = {

//     setHost,

//     addViewer,

//     getSession,

//     removeClient

// };


/**
 * In-memory session manager.
 *
 * Structure:
 *
 * sessions = Map(
 *      sessionId => {
 *          host: WebSocket | null,
 *          viewers: Set<WebSocket>
 *      }
 * )
 */

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