// require("dotenv").config();

// const express = require("express");
// const http = require("http");

// const authRoutes =
//   require("./src/mobile/routes/authRoute");
// const sessionRoutes =
//   require("./src/mobile/routes/sessionRoute");

// const initializeWebSocket = require("./src/mobile/websocket/websocket");

// const app = express();

// app.use(express.json());

// app.use(
//   "/api",
//   authRoutes
// );
// app.use(
//   "/api",
//   sessionRoutes
// );

// app.get("/", (req, res) => {
//   res.send(
//     "Welcome to the NeuralStream API this is testing"
//   );
// });

// const server = http.createServer(app);
// // for production use below
// // const server = https.createServer(sslOptions, app);

// initializeWebSocket(server);

// // app.listen(
// //   process.env.PORT || 3000,
// //   () => {
// //     console.log(
// //       "Server Started"
// //     );
// //   }
// // );

// server.listen(process.env.PORT || 3000, () => {
//     console.log(`Server Started on ${process.env.PORT || 3000}`);
// });


// index.js
require("dotenv").config();

const express = require("express");
const http = require("http");

const authRoutes = require("./src/mobile/routes/authRoute");
const sessionRoutes = require("./src/mobile/routes/sessionRoute");
const initializeWebSocket = require("./src/mobile/websocket/websocket");

const app = express();
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", sessionRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the NeuralStream API");
});

// Main HTTP server for Express (Passenger manages this)
const server = http.createServer(app);

// Separate HTTP server just for WebSocket
// This bypasses Passenger completely
const wsServer = http.createServer();

initializeWebSocket(wsServer);

server.listen(process.env.PORT || 3000, () => {
    console.log(`HTTP Server Started on ${process.env.PORT || 3000}`);
});

// WebSocket on separate port
wsServer.listen(process.env.WS_PORT || 3001, () => {
    console.log(`WebSocket Server Started on ${process.env.WS_PORT || 3001}`);
});