// const pool = require("../../config/db");

// /**
//  * Create Live Session
//  */
// const createSession = async (
//   userId,
//   deviceId,
//   sessionName
// ) => {

//   // Verify device belongs to user
//   const device = await pool.query(
//     `
//     SELECT device_id
//     FROM user_devices
//     WHERE device_id = $1
//     AND user_id = $2
//     `,
//     [deviceId, userId]
//   );

//   if (device.rows.length === 0) {
//     throw new Error("Invalid device");
//   }

//   // Allow only one active session per device
//   const activeSession = await pool.query(
//     `
//     SELECT session_id
//     FROM live_sessions
//     WHERE device_id = $1
//     AND status = 'ACTIVE'
//     `,
//     [deviceId]
//   );

//   if (activeSession.rows.length > 0) {
//     throw new Error(
//       "Device already has an active session"
//     );
//   }

//   const result = await pool.query(
//     `
//     INSERT INTO live_sessions
//     (
//       host_user_id,
//       device_id,
//       session_name
//     )
//     VALUES
//     (
//       $1,
//       $2,
//       $3
//     )
//     RETURNING *
//     `,
//     [
//       userId,
//       deviceId,
//       sessionName
//     ]
//   );

//   return result.rows[0];
// };

// /**
//  * Join Session
//  */
// // const joinSession = async (
// //   sessionId
// // ) => {

// //   const session = await pool.query(
// //     `
// //     SELECT *
// //     FROM live_sessions
// //     WHERE session_id = $1
// //     `,
// //     [sessionId]
// //   );

// //   if (session.rows.length === 0) {
// //     throw new Error(
// //       "Session not found"
// //     );
// //   }

// //   if (
// //     session.rows[0].status !== "ACTIVE"
// //   ) {
// //     throw new Error(
// //       "Session is closed"
// //     );
// //   }

// //   return session.rows[0];
// // };


// const joinSession = async (
//     sessionId,
//     userId,
//     deviceId
// ) => {

//     const session = await pool.query(
//         `
//         SELECT *
//         FROM live_sessions
//         WHERE session_id = $1
//         AND status = 'ACTIVE'
//         `,
//         [sessionId]
//     );

//     if (session.rows.length === 0) {
//         throw new Error("Session not found");
//     }

//     await pool.query(
//         `
//         INSERT INTO session_viewers
//         (
//             session_id,
//             viewer_user_id,
//             device_id
//         )
//         VALUES
//         (
//             $1,
//             $2,
//             $3
//         )
//         ON CONFLICT
//         (
//             session_id,
//             device_id
//         )
//         DO UPDATE
//         SET

//             status='CONNECTED',

//             joined_at=NOW(),

//             left_at=NULL
//         `,
//         [
//             sessionId,
//             userId,
//             deviceId
//         ]
//     );

//     return session.rows[0];

// };

// /**
//  * End Session
//  */
// const endSession = async (
//   sessionId,
//   userId
// ) => {

//   const session = await pool.query(
//     `
//     SELECT *
//     FROM live_sessions
//     WHERE session_id = $1
//     `,
//     [sessionId]
//   );

//   if (session.rows.length === 0) {
//     throw new Error(
//       "Session not found"
//     );
//   }

//   if (
//     session.rows[0].host_user_id !== userId
//   ) {
//     throw new Error(
//       "Unauthorized"
//     );
//   }

// //   await pool.query(
// //     `
// //     UPDATE live_sessions
// //     SET
// //       status='ENDED',
// //       ended_at=NOW()
// //     WHERE session_id=$1
// //     `,
// //     [sessionId]
// //   );
// await pool.query("BEGIN");

// await pool.query(
// `
// UPDATE live_sessions
// SET

// status='ENDED',

// ended_at=NOW()

// WHERE session_id=$1
// `,
// [sessionId]
// );

// await pool.query(
// `
// UPDATE session_viewers
// SET

// status='DISCONNECTED',

// left_at=NOW()

// WHERE session_id=$1
// `,
// [sessionId]
// );

// await pool.query("COMMIT");

//   return true;
// };

// /**
//  * Get Session
//  */
// const getSession = async (
//   sessionId
// ) => {

//   const result = await pool.query(
//     `
//     SELECT *
//     FROM live_sessions
//     WHERE session_id = $1
//     `,
//     [sessionId]
//   );

//   if (result.rows.length === 0) {
//     throw new Error(
//       "Session not found"
//     );
//   }

//   return result.rows[0];
// };

// /**
//  * Validate Host
//  * (Used by WebSocket)
//  */
// const validateHost = async (
//   sessionId,
//   userId
// ) => {

//   const result = await pool.query(
//     `
//     SELECT *
//     FROM live_sessions
//     WHERE session_id=$1
//     AND host_user_id=$2
//     AND status='ACTIVE'
//     `,
//     [
//       sessionId,
//       userId
//     ]
//   );

//   return result.rows.length > 0;
// };

// const leaveSession = async (
//     sessionId,
//     deviceId
// ) => {

//     await pool.query(
//         `
//         UPDATE session_viewers
//         SET

//             status='DISCONNECTED',

//             left_at=NOW()

//         WHERE

//             session_id=$1

//         AND

//             device_id=$2
//         `,
//         [
//             sessionId,
//             deviceId
//         ]
//     );

// };

// module.exports = {

//   createSession,

//   joinSession,

//   endSession,

//   getSession,

//   validateHost

// };




const pool = require("../../config/db");

class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Create Live Session
 */
const createSession = async (
    userId,
    deviceId,
    sessionName
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        if (!deviceId) {
            throw new ApiError(400, "Device Id is required");
        }

        if (
            !sessionName ||
            sessionName.trim().length === 0
        ) {
            throw new ApiError(400, "Session name is required");
        }

        if (sessionName.length > 100) {
            throw new ApiError(
                400,
                "Session name cannot exceed 100 characters"
            );
        }

        // Verify device ownership
        const device = await client.query(
            `
            SELECT device_id
            FROM user_devices
            WHERE device_id = $1
            AND user_id = $2
            `,
            [
                deviceId,
                userId
            ]
        );


        if (device.rowCount === 0) {
            throw new ApiError(
                403,
                "Invalid device"
            );
        }

        // Check active session
        const active = await client.query(
            `
            SELECT session_id
            FROM live_sessions
            WHERE device_id = $1
            AND status='ACTIVE'
            `,
            [deviceId]
        );

        if (active.rowCount > 0) {
            throw new ApiError(
                409,
                "Device already has an active session"
            );
        }

        const result = await client.query(
            `
            INSERT INTO live_sessions
            (
                host_user_id,
                device_id,
                session_name
            )
            VALUES
            (
                $1,
                $2,
                $3
            )
            RETURNING
                session_id,
                host_user_id,
                device_id,
                session_name,
                status,
                started_at
            `,
            [
                userId,
                deviceId,
                sessionName.trim()
            ]
        );

        await client.query("COMMIT");

        return result.rows[0];

    } catch (err) {

        await client.query("ROLLBACK");

        throw err;

    } finally {

        client.release();

    }

};

/**
 * Join Session
 */
const joinSession = async (
    sessionId,
    userId,
    deviceId
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        if (!sessionId)
            throw new ApiError(
                400,
                "Session Id required"
            );

        if (!deviceId)
            throw new ApiError(
                400,
                "Device Id required"
            );

        // Verify device ownership
        const device = await client.query(
            `
            SELECT device_id
            FROM user_devices
            WHERE device_id=$1
            AND user_id=$2
            `,
            [
                deviceId,
                userId
            ]
        );
        console.log("deviceId", deviceId);
        console.log("userId", userId);
        if (device.rowCount === 0) {
            throw new ApiError(
                403,
                "Invalid device"
            );
        }

        // Fetch session
        const session = await client.query(
            `
            SELECT
                session_id,
                host_user_id,
                status
            FROM live_sessions
            WHERE session_id=$1
            `,
            [sessionId]
        );

        if (session.rowCount === 0) {
            throw new ApiError(
                404,
                "Session not found"
            );
        }

        const liveSession = session.rows[0];

        if (liveSession.status !== "ACTIVE") {
            throw new ApiError(
                409,
                "Session has already ended"
            );
        }
        console.log("Host User ID :", liveSession.host_user_id);
        console.log("JWT User ID  :", userId);
        console.log("Device ID    :", deviceId);
        if (liveSession.host_user_id == userId) {
            throw new ApiError(
                400,
                "Host cannot join as viewer"
            );
        }

        await client.query(
            `
            INSERT INTO session_viewers
            (
                session_id,
                viewer_user_id,
                device_id,
                status
            )
            VALUES
            (
                $1,
                $2,
                $3,
                'CONNECTED'
            )

            ON CONFLICT
            (
                session_id,
                device_id
            )

            DO UPDATE
            SET

                status='CONNECTED',

                joined_at=NOW(),

                left_at=NULL
            `,
            [
                sessionId,
                userId,
                deviceId
            ]
        );

        await client.query("COMMIT");

        return {
            sessionId,
            status: "CONNECTED"
        };

    } catch (err) {

        await client.query("ROLLBACK");

        throw err;

    } finally {

        client.release();

    }

};

/**
 * Leave Session
 */
const leaveSession = async (
    sessionId,
    userId,
    deviceId
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const result = await client.query(
            `
            UPDATE session_viewers
            SET

                status='DISCONNECTED',

                left_at=NOW()

            WHERE

                session_id=$1

            AND

                viewer_user_id=$2

            AND

                device_id=$3
            
            AND status='CONNECTED'

            RETURNING id
            `,
            [
                sessionId,
                userId,
                deviceId
            ]
        );

        // if (result.rowCount === 0) {
        //     throw new ApiError(
        //         404,
        //         "Viewer not found"
        //     );
        // }
        // Viewer may already be disconnected.
        // This is acceptable during websocket cleanup. 

        await client.query("COMMIT");

        return true;

    } catch (err) {

        await client.query("ROLLBACK");

        throw err;

    } finally {

        client.release();

    }

};

/**
 * End Session
 */
const endSession = async (
    sessionId,
    userId
) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const result = await client.query(
            `
            UPDATE live_sessions

            SET

                status='ENDED',

                ended_at=NOW()

            WHERE

                session_id=$1

            AND

                host_user_id=$2

            AND

                status='ACTIVE'

            RETURNING session_id
            `,
            [
                sessionId,
                userId
            ]
        );
        console.log("Session ID :", sessionId);
        console.log("User ID    :", userId);
        if (result.rowCount === 0) {
            throw new ApiError(
                403,
                "Unauthorized or session already ended"
            );
        }

        await client.query(
            `
            UPDATE session_viewers

            SET

                status='DISCONNECTED',

                left_at=NOW()

            WHERE

                session_id=$1

            AND

                status='CONNECTED'
            `,
            [sessionId]
        );

        await client.query("COMMIT");

        return true;

    } catch (err) {

        await client.query("ROLLBACK");

        throw err;

    } finally {

        client.release();

    }

};

/**
 * Get Session
 */
const getSession = async (
    sessionId
) => {

    const result = await pool.query(
        `
        SELECT

            session_id,

            host_user_id,

            device_id,

            session_name,

            status,

            started_at,

            ended_at

        FROM live_sessions

        WHERE session_id=$1
        `,
        [sessionId]
    );

    if (result.rowCount === 0) {
        throw new ApiError(
            404,
            "Session not found"
        );
    }

    return result.rows[0];

};

/**
 * Validate Host
 */
const validateHost = async (
    sessionId,
    userId
) => {

    const result = await pool.query(
        `
        SELECT 1
        FROM live_sessions
        WHERE

            session_id=$1

        AND

            host_user_id=$2

        AND

            status='ACTIVE'
        `,
        [
            sessionId,
            userId
        ]
    );

    return result.rowCount > 0;

};

const isSessionActive = async (sessionId) => {

    const result = await pool.query(
        `
        SELECT 1
        FROM live_sessions
        WHERE

            session_id = $1

        AND

            status = 'ACTIVE'
        `,
        [sessionId]
    );

    return result.rowCount > 0;

};

module.exports = {

    createSession,

    joinSession,

    leaveSession,

    endSession,

    getSession,

    validateHost,

    isSessionActive,

    ApiError

};