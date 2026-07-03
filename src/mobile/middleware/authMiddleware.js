// const { verifyToken } = require("../utils/authJwt");

// const authenticateToken = (req, res, next) => {

//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({
//             success: false,
//             message: "Missing access token"
//         });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = verifyToken(token);

//     if (!decoded) {
//         return res.status(401).json({
//             success: false,
//             message: "Invalid or expired token"
//         });
//     }

//     req.user = decoded;

//     next();
// };

// module.exports = authenticateToken;

// const { verifyToken } = require("../utils/authJwt");

// const authenticateToken = (req, res, next) => {

//     const authHeader = req.headers.authorization;

//     console.log("Authorization Header:", authHeader);

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({
//             success: false,
//             message: "Missing access token"
//         });
//     }

//     const token = authHeader.split(" ")[1];

//     console.log("JWT:", token);

//     const decoded = verifyToken(token);

//     console.log("Decoded:", decoded);

//     if (!decoded) {
//         return res.status(401).json({
//             success: false,
//             message: "Invalid or expired token"
//         });
//     }

//     req.user = decoded;

//     next();
// };

// module.exports = authenticateToken;







// const { verifyToken } = require("../utils/authJwt");

// const authenticateToken = (req, res, next) => {
//     try {

//         const authHeader = req.headers.authorization;

//         if (!authHeader?.startsWith("Bearer ")) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Missing access token"
//             });
//         }

//         const token = authHeader.split(" ")[1];

//         req.user = verifyToken(token);

//         next();

//     } catch (err) {

//         return res.status(401).json({
//             success: false,
//             message: "Invalid or expired token"
//         });

//     }
// };

// module.exports = authenticateToken;









const { verifyToken } = require("../utils/authJwt");

const authenticateToken = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Missing access token"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyToken(token);

        // Extra safety check
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).json({
            success: false,
            // Show specific JWT error in development
            message: process.env.NODE_ENV === "development"
                ? err.message
                : "Invalid or expired token"
        });

    }
};

module.exports = authenticateToken;