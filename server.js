// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

// ✅ CREATE APP FIRST
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ ROOT ROUTE (ONLY ONCE)
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "LocalSetu backend is running",
  });
});

// HTTP + Socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Socket logic
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-shop", (shopId) => {
    socket.join(shopId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/shop", require("./routes/shopRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/order")(io));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

// ✅ 404 MUST BE LAST
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start
const PORT = process.env.PORT || 10000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
