// const authService =
//   require("../services/authService");

// const {
//   signupSchema,
//   loginSchema,
// } = require("../validators/authValidator");

// const {
//   getDeviceInfo,
// } = require("../utils/device");

// const signupController =
//   async (req, res) => {

//     try {

//       const { error } =
//         signupSchema.validate(req.body);

//       if (error) {
//         return res.status(400).json({
//           success: false,
//           message:
//             error.details[0].message,
//         });
//       }

//       const user =
//         await authService.signup(
//           req.body
//         );

//       return res.status(201).json({
//         success: true,
//         user,
//       });

//     } catch (err) {

//       return res.status(400).json({
//         success: false,
//         message: err.message,
//       });

//     }
// };


// const loginController =
//   async (req, res) => {

//     try {

//       const { error } =
//         loginSchema.validate(req.body);

//       if (error) {
//         return res.status(400).json({
//           success: false,
//           message:
//             error.details[0].message,
//         });
//       }

//       const fingerprint =
//         req.headers[
//           "device-fingerprint"
//         ];

//       if (!fingerprint) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Device fingerprint required",
//         });
//       }

//       const deviceInfo =
//         getDeviceInfo(req);

//       const result =
//         await authService.login(
//           req.body.email,
//           req.body.password,
//           fingerprint,
//           deviceInfo
//         );

//       return res.status(200).json({
//         success: true,
//         ...result,
//       });

//     } catch (err) {

//       return res.status(400).json({
//         success: false,
//         message: err.message,
//       });

//     }
// };

// module.exports = {
//   signupController,
//   loginController,
// };



const authService =
  require("../services/authService");

const {
  signupSchema,
  loginSchema,
} = require("../validators/authValidator");

const {
  getDeviceInfo,
} = require("../utils/device");

/**
 * SIGNUP
 */
const signupController =
  async (req, res) => {

    try {

      const { error } =
        signupSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message:
            error.details[0].message,
        });
      }

      const user =
        await authService.signup(
          req.body
        );

      return res.status(201).json({
        success: true,
        message:
          "User created successfully",
        data: user,
      });

    } catch (err) {

      return res.status(400).json({
        success: false,
        message: err.message,
      });

    }
};

/**
 * LOGIN
 */
const loginController =
  async (req, res) => {

    try {

      const { error } =
        loginSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message:
            error.details[0].message,
        });
      }

      const fingerprint =
        req.headers[
          "device-fingerprint"
        ];

      if (!fingerprint) {
        return res.status(400).json({
          success: false,
          message:
            "Device fingerprint required",
        });
      }

      const deviceInfo =
        getDeviceInfo(req);

      const result =
        await authService.login(
          req.body.email,
          req.body.password,
          fingerprint,
          deviceInfo
        );

      return res.status(200).json({
        success: true,
        message:
          "Login successful",
        data: result,
      });

    } catch (err) {

      return res.status(400).json({
        success: false,
        message: err.message,
      });

    }
};

/**
 * LOGOUT CURRENT DEVICE
 */
const logoutController =
  async (req, res) => {

    try {

      // const {
      //   userId,
      //   deviceId
      // } = req.body;
      const {
  userId,
  deviceFingerprint
} = req.body;

      // if (
      //   !userId ||
      //   !deviceId
      // ) {
      //   return res.status(400).json({
      //     success: false,
      //     message:
      //       "userId and deviceId are required",
      //   });
      // }

      if (
  !userId ||
  !deviceFingerprint
) {
  return res.status(400).json({
    success: false,
    message:
      "userId and deviceFingerprint are required",
  });
}

      await authService.logout(
  userId,
  deviceFingerprint
);

      return res.status(200).json({
        success: true,
        message:
          "Logged out successfully",
      });

    } catch (err) {

      return res.status(400).json({
        success: false,
        message: err.message,
      });

    }
};

/**
 * LOGOUT ALL DEVICES
 */
const logoutAllDevicesController =
  async (req, res) => {

    try {

      const {
        userId
      } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message:
            "userId is required",
        });
      }

      await authService.logoutAllDevices(
        userId
      );

      return res.status(200).json({
        success: true,
        message:
          "Logged out from all devices",
      });

    } catch (err) {

      return res.status(400).json({
        success: false,
        message: err.message,
      });

    }
};

module.exports = {
  signupController,
  loginController,
  logoutController,
  logoutAllDevicesController,
};