require("dotenv").config();
const express = require("express");
const Sentry = require("@sentry/node");
const http = require("http");
const { initSocket } = require("./socket");

const authRoutes = require("./routes/authRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

const app = express();
const server = http.createServer(app);

initSocket(server);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/forget-password", (req, res) => {
  res.render("forget-password");
});
app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.use("/auth", authRoutes);
app.use("/password", passwordRoutes);

app.use((err, req, res, next) => {
  Sentry.captureException(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`aku cinta ${PORT}`));

module.exports = app;
