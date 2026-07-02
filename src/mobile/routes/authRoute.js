const express = require("express");
const router = express.Router();

const {

    signupController,

    loginController,

    logoutController,

    logoutAllDevicesController,

    firebaseAuthController,

    refreshTokenController

} = require("../controllers/authController");


router.post(
  "/auth/signup",
  signupController
);

router.post(
  "/auth/login",
  loginController
);

router.post(
  "/auth/logout",
  logoutController
);

router.post(
  "/auth/logout-all",
  logoutAllDevicesController
);

router.post(
  "/auth/firebase",
  firebaseAuthController
);

router.post(
    "/auth/refresh",
    refreshTokenController
);

module.exports = router;