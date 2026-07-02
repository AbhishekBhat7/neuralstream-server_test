// const express = require("express");

// const router = express.Router();

// const sessionController = require(
//   "../controllers/sessionController"
// );

// const authenticateToken = require(
//   "../middleware/authMiddleware"
// );

// // Create Session
// router.post(
//   "/session/create",
//   authenticateToken,
//   sessionController.createSession
// );

// // Join Session
// router.post(
//   "/session/join",
//   authenticateToken,
//   sessionController.joinSession
// );

// // End Session
// router.post(
//   "/session/end",
//   authenticateToken,
//   sessionController.endSession
// );

// // Get Session
// router.get(
//   "/session/:id",
//   authenticateToken,
//   sessionController.getSession
// );

// module.exports = router;

const express = require("express");

const router = express.Router();

const sessionController = require("../controllers/sessionController");

const authenticateToken = require("../middleware/authMiddleware");

/**
 * Create Live Session
 */
router.post(
    "/session/create",
    authenticateToken,
    sessionController.createSession
);

/**
 * Join Session
 */
router.post(
    "/session/join",
    authenticateToken,
    sessionController.joinSession
);

/**
 * Leave Session
 */
router.post(
    "/session/leave",
    authenticateToken,
    sessionController.leaveSession
);

/**
 * End Session
 */
router.post(
    "/session/end",
    authenticateToken,
    sessionController.endSession
);

/**
 * Get Session
 */
router.get(
    "/session/:id",
    authenticateToken,
    sessionController.getSession
);

module.exports = router;