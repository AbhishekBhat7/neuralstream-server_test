require("dotenv").config();

const express = require("express");

const authRoutes =
  require("./src/mobile/routes/authRoute");

const app = express();

app.use(express.json());

app.use(
  "/api",
  authRoutes
);

app.listen(
  process.env.PORT || 3000,
  () => {
    console.log(
      "Server Started"
    );
  }
);