// const sessionService = require(
//   "../services/sessionService"
// );

// /**
//  * POST /session/create
//  */
// const createSession = async (
//   req,
//   res
// ) => {

//   try {

//     const {

//       deviceId,

//       sessionName

//     } = req.body;

//     const session =
//       await sessionService.createSession(

//         req.user.userId,

//         deviceId,

//         sessionName

//       );

//     return res.status(201).json({

//       success: true,

//       message:
//         "Session created",

//       data: session

//     });

//   } catch (err) {

//     return res.status(400).json({

//       success: false,

//       message: err.message

//     });

//   }

// };

// /**
//  * POST /session/join
//  */
// // const joinSession = async (
// //   req,
// //   res
// // ) => {

// //   try {

// //     const {

// //       sessionId

// //     } = req.body;

// //     const session =
// //       await sessionService.joinSession(
// //         sessionId
// //       );

// //     return res.json({

// //       success: true,

// //       data: session

// //     });

// //   } catch (err) {

// //     return res.status(400).json({

// //       success: false,

// //       message: err.message

// //     });

// //   }

// // };

// const joinSession = async (req, res) => {
//   try {
//     const {
//       sessionId,
//       userId,
//       deviceId
//     } = req.body;

//     const session = await sessionService.joinSession(
//       sessionId,
//       userId,
//       deviceId
//     );

//     return res.json({
//       success: true,
//       data: session
//     });

//   } catch (err) {
//     return res.status(400).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * POST /session/end
//  */
// const endSession = async (
//   req,
//   res
// ) => {

//   try {

//     const {

//       sessionId

//     } = req.body;

//     await sessionService.endSession(

//       sessionId,

//       req.user.userId

//     );

//     return res.json({

//       success: true,

//       message:
//         "Session ended"

//     });

//   } catch (err) {

//     return res.status(400).json({

//       success: false,

//       message: err.message

//     });

//   }

// };

// /**
//  * GET /session/:id
//  */
// const getSession = async (
//   req,
//   res
// ) => {

//   try {

//     const session =
//       await sessionService.getSession(
//         req.params.id
//       );

//     return res.json({

//       success: true,

//       data: session

//     });

//   } catch (err) {

//     return res.status(404).json({

//       success: false,

//       message: err.message

//     });

//   }

// };

// module.exports = {

//   createSession,

//   joinSession,

//   endSession,

//   getSession

// };



const sessionService = require("../services/sessionService");

/**
 * Create Session
 */
const createSession = async (req, res) => {

    try {

        const {
            deviceId,
            sessionName
        } = req.body;

        const session = await sessionService.createSession(
            req.user.userId,
            deviceId,
            sessionName
        );

        return res.status(201).json({
            success: true,
            message: "Session created successfully",
            data: session
        });

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });

    }

};

/**
 * Join Session
 */
const joinSession = async (req, res) => {

    try {

        const {
            sessionId,
            deviceId
        } = req.body;

        const session = await sessionService.joinSession(
            sessionId,
            req.user.userId,
            deviceId
        );

        return res.status(200).json({
            success: true,
            message: "Joined session successfully",
            data: session
        });

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });

    }

};

/**
 * Leave Session
 */
const leaveSession = async (req, res) => {

    try {

        const {
            sessionId,
            deviceId
        } = req.body;

        await sessionService.leaveSession(
            sessionId,
            req.user.userId,
            deviceId
        );

        return res.status(200).json({
            success: true,
            message: "Left session successfully"
        });

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });

    }

};

/**
 * End Session
 */
const endSession = async (req, res) => {

    try {

        const {
            sessionId
        } = req.body;

        await sessionService.endSession(
            sessionId,
            req.user.userId
        );
        console.log("Session ended successfully for sessionId:", sessionId);
        console.log("User ID:", req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Session ended successfully"
        });

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });

    }

};

/**
 * Get Session
 */
const getSession = async (req, res) => {

    try {

        const session = await sessionService.getSession(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            data: session
        });

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });

    }

};

module.exports = {

    createSession,

    joinSession,

    leaveSession,

    endSession,

    getSession

};