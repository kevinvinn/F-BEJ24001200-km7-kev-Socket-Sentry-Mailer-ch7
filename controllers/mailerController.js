const nodemailer = require("nodemailer");

const sendForgotPasswordEmail = async (email, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click the link below to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email");
  }
};

module.exports = {
  sendForgotPasswordEmail,
};
