const bcrypt = require("bcrypt");
const prisma = require("../prisma/client");
const { getSocket } = require("../socket");

exports.register = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).send("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  const io = getSocket();
  if (io) {
    io.emit(
      "response",
      "Pendaftaran berhasil,kembali ke halaman login untuk melanjutkan"
    );
  }

  // res.render("register", {
  //   message: "Pendaftaran berhasil, kamu akan diarahkan ke halaman login.",
  // });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).send("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send("Invalid email or password");
    }

    const io = getSocket();
    if (io) {
      io.emit("response", {
        email: user.email,
      });
    }

    // res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred during login");
  }
};
