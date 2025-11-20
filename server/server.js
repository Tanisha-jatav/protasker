import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🟣 Allowed front-end domains (localhost + vercel)
const allowedOrigins = [
  "http://localhost:3000",
  "https://protasker-tau.vercel.app",     // ⭐ YOUR VERCEL FRONTEND URL
  "https://protasker-*.vercel.app",       // in case vercel uses preview domains
];

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://protasker-tau.vercel.app"   // <- YOUR FRONTEND VERCEL URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json({ limit: "15mb" }));

// Test route
app.get("/", (req, res) => {
  res.send("🚀 ProTasker Server Running Successfully!");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/projects", projectRoutes);

// MongoDB connect
const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    server.listen(PORT, () =>
      console.log(`🚀 Server running with Socket.io on port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));


// 🟣 SOCKET.IO CORS FIX
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// Socket events
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinProject", (projectId, userName) => {
    socket.join(projectId);
    io.to(projectId).emit("userJoined", { userName });
  });

  socket.on("leaveProject", (projectId, userName) => {
    socket.leave(projectId);
    io.to(projectId).emit("userLeft", { userName });
  });

  socket.on("sendMessage", (data) => {
    io.to(data.projectId).emit("receiveMessage", data);
  });

  socket.on("deleteMessage", ({ projectId, messageId }) => {
    io.to(projectId).emit("messageDeleted", messageId);
  });

  socket.on("typing", ({ projectId, userName, typing }) => {
    io.to(projectId).emit("typing", { userName, typing });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});
