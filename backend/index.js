import dotenv from "dotenv";
import http from "http";
import connectDB from "./config/mongoDB.js";
import app from "./app.js";
import { initSocket } from "./config/socket.js";

dotenv.config();

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io on this server
initSocket(server);

// Start the server
const PORT =  5004;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`WebSocket ready for real-time connections`);
});
