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


app.use(
  cors({
    origin: "http://localhost:3000", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



app.use(express.json({ limit: "15mb" })); 

app.get("/", (req, res) => {
  res.send("🚀 ProTasker Server Running Successfully!");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/projects", projectRoutes);

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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Join project chat room
  socket.on("joinProject", (projectId, userName) => {
    socket.join(projectId);
    console.log(`👥 ${userName} joined project ${projectId}`);
    io.to(projectId).emit("userJoined", { userName });
  });

  // Leave room
  socket.on("leaveProject", (projectId, userName) => {
    socket.leave(projectId);
    console.log(`👋 ${userName} left project ${projectId}`);
    io.to(projectId).emit("userLeft", { userName });
  });

  // New message
  socket.on("sendMessage", (data) => {
    io.to(data.projectId).emit("receiveMessage", data);
  });

  // Delete
  socket.on("deleteMessage", ({ projectId, messageId }) => {
    io.to(projectId).emit("messageDeleted", messageId);
  });

  // Typing Indicator
  socket.on("typing", ({ projectId, userName, typing }) => {
    io.to(projectId).emit("typing", { userName, typing });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});
