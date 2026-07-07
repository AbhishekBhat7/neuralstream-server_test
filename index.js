const express = require("express");


const authRoutes = require("./src/mobile/routes/authRoute");
const sessionRoutes = require("./src/mobile/routes/sessionRoute");

const app = express();

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", sessionRoutes);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Welcome to the NeuralStream API");
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


module.exports = app;