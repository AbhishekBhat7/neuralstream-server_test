require("dotenv").config();

const express = require("express");
const http = require("http");

const authRoutes =
  require("./src/mobile/routes/authRoute");
const sessionRoutes =
  require("./src/mobile/routes/sessionRoute");

const initializeWebSocket = require("./src/mobile/websocket/websocket");

const app = express();

app.use(express.json());

app.use(
  "/api",
  authRoutes
);
app.use(
  "/api",
  sessionRoutes
);

app.get("/", (req, res) => {
  res.send(
    "Welcome to the NeuralStream API this is testing"
  );
});

const server = http.createServer(app);
// for production use below
// const server = https.createServer(sslOptions, app);

initializeWebSocket(server);

// app.listen(
//   process.env.PORT || 3000,
//   () => {
//     console.log(
//       "Server Started"
//     );
//   }
// );

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server Started on ${process.env.PORT || 3000}`);
});