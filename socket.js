const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server);
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}

function getSocket() {
  return io;
}

module.exports = { initSocket, getSocket };
