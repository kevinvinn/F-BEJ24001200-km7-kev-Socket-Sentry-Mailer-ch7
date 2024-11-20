const express = require("express");
const {
  forgetPassword,
  resetPasswordPage,
  resetPassword,
} = require("../controllers/passwordController");

const router = express.Router();
router.post("/forget-password", forgetPassword);
router.get("/reset-password", (req, res) => {
  const token = req.query.token || "";
  const message = req.query.message || "";
  res.render("reset-password", { token, message });
});
router.post("/reset-password", resetPassword);

module.exports = router;
