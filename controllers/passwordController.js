const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendForgotPasswordEmail } = require("../controllers/mailerController");
const { getSocket } = require("../socket");

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await prisma.passwordResetToken.create({
    data: {
      token: token,
      userId: user.id,
    },
  });

  const resetLink = `${req.protocol}://${req.get(
    "host"
  )}/password/reset-password?token=${token}`;

  try {
    await sendForgotPasswordEmail(email, resetLink);

    const io = getSocket();
    if (io) {
      io.emit("response", "Link reset password telah dikirim ke email Anda!");
    }

    res.status(200).json({ message: "Reset link sent to email" });
  } catch (err) {
    console.error("Error sending email:", err.message);
    res.status(500).json({ message: "Failed to send email" });
  }
};

exports.resetPasswordPage = (req, res) => {
  const token = req.query.token;
  res.render("reset-password", { token });
};

exports.resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).send({ message: "Passwords do not match" });
  }

  try {
    // Verify JWT token
    const { email } = jwt.verify(token, process.env.JWT_SECRET);

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        user: { email },
      },
    });

    if (!resetToken) {
      return res.status(404).send({ message: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Delete reset token from database
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Emit notification for password reset success
    const io = getSocket();
    if (io) {
      io.emit("response", "Password berhasil direset! Silakan login.");
    }

    // Respond to show the modal
    res.status(200).json({
      message:
        "Password berhasil direset! Anda akan diarahkan ke halaman login.",
    });
  } catch (err) {
    console.error("JWT verification error:", err.message);
    res.status(400).send({ message: "Invalid or expired token" });
  }
};
