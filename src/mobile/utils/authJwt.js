// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

// // const generateAccessToken = (user) => {
// //   return jwt.sign(
// //     {
// //       userId: user.user_id,
// //       email: user.email,
// //     },
// //     process.env.JWT_SECRET,
// //     {
// //       expiresIn: "15m",
// //     }
// //   );
// // };

// const generateAccessToken = (
//     user,
//     deviceId
// ) => {

//     return jwt.sign(
//         {
//             userId: user.user_id,
//             email: user.email,
//             deviceId
//         },
//         process.env.JWT_SECRET,
//         {
//             expiresIn: "60m"
//         }
//     );

// };

// const generateRefreshToken = () => {
//   return crypto.randomUUID();
// };

// // function verifyToken(token) {
// //     try {
// //         const decoded = jwt.verify(
// //             token,
// //             process.env.JWT_SECRET
// //         );

// //         return decoded;
// //     } catch (err) {
// //         return null;
// //     }
// // }
// function verifyToken(token) {

//     console.log("JWT_SECRET:", process.env.JWT_SECRET);

//     try {

//         const decoded = jwt.verify(
//             token,
//             process.env.JWT_SECRET
//         );

//         return decoded;

//     } catch (err) {

//         console.log(err);

//         return null;
//     }

// }
// module.exports = {
//   generateAccessToken,
//   generateRefreshToken,
//   verifyToken
// };

// 
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

// /**
//  * Access Token
//  */
// const ACCESS_TOKEN_EXPIRY =
//     process.env.ACCESS_TOKEN_EXPIRY || "30m";

// /**
//  * Refresh Token Validity
//  *
//  * Used only while creating DB records.
//  */
// const REFRESH_TOKEN_VALIDITY_DAYS =
//     parseInt(
//         process.env.REFRESH_TOKEN_VALIDITY_DAYS || "60",
//         10
//     );

// /**
//  * Generate JWT Access Token
//  */
// const generateAccessToken = (
//     user,
//     deviceId
// ) => {

//     return jwt.sign(
//         {
//             userId: user.user_id,
//             email: user.email,
//             deviceId
//         },
//         process.env.JWT_SECRET,
//         {
//             expiresIn: ACCESS_TOKEN_EXPIRY
//         }
//     );

// };

// /**
//  * Generate Secure Refresh Token
//  */
// const generateRefreshToken = () => {

//     return crypto
//         .randomBytes(64)
//         .toString("hex");

// };

// /**
//  * SHA256 Hash
//  *
//  * Refresh tokens are never stored
//  * directly in the database.
//  */
// const hashRefreshToken = (
//     refreshToken
// ) => {

//     return crypto
//         .createHash("sha256")
//         .update(refreshToken)
//         .digest("hex");

// };

// /**
//  * Verify JWT
//  */
// const verifyToken = (
//     token
// ) => {

//     try {

//         return jwt.verify(
//             token,
//             process.env.JWT_SECRET
//         );

//     } catch {

//         return null;

//     }

// };

// /**
//  * Decode JWT
//  *
//  * Doesn't verify signature.
//  * Useful only for debugging.
//  */
// const decodeToken = (
//     token
// ) => {

//     return jwt.decode(token);

// };

// module.exports = {

//     ACCESS_TOKEN_EXPIRY,

//     REFRESH_TOKEN_VALIDITY_DAYS,

//     generateAccessToken,

//     generateRefreshToken,

//     hashRefreshToken,

//     verifyToken,

//     decodeToken

// };












const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_TOKEN_EXPIRY =
    process.env.ACCESS_TOKEN_EXPIRY || "30m";

const REFRESH_TOKEN_VALIDITY_DAYS =
    parseInt(
        process.env.REFRESH_TOKEN_VALIDITY_DAYS || "60",
        10
    );

const generateAccessToken = (user, deviceId) => {
    return jwt.sign(
        {
            userId: user.user_id,
            email: user.email,
            deviceId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    );
};

const generateRefreshToken = () => {
    return crypto
        .randomBytes(64)
        .toString("hex");
};

const hashRefreshToken = (refreshToken) => {
    return crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
};

/**
 * FIXED: Now throws instead of returning null
 * So middleware catch block works correctly
 */
const verifyToken = (token) => {
    // No try/catch here — let it throw naturally
    return jwt.verify(token, process.env.JWT_SECRET);
};

const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_VALIDITY_DAYS,
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    verifyToken,
    decodeToken
};