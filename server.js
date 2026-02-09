// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "LocalSetu backend is running",
  });
});

// App
const app = express();
app.use(cors());
app.use(express.json());

// HTTP + Socket
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Socket logic
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-shop", (shopId) => {
        socket.join(shopId);
        console.log(`Joined shop room: ${shopId}`);
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
app.use("/api/orders", require("./routes/order")(io)); // ✅ inject io here
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/admin", adminRoutes);



// Mongo
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(console.error);

// 404
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.get("/", (req, res) => {
    res.status(200).json({
        status: "OK",
        service: "LocalSetu Backend",
        uptime: process.uptime()
    });
});

// Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);
