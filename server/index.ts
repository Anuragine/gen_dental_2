import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import { handleDemo } from "./routes/demo";
import { handleRegister, handleLogin, handleUpdateProfile } from "./routes/auth";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  getAllAppointments,
  confirmAppointment,
  handleGetUserAppointments,
  handleUpdateAppointmentFromChat,
  handleApproveAppointment,
  handleCancelAppointment,
  handleSetReminder,
  handleGetPatientAppointments,
  handleGetPatientDetails,
} from "./routes/appointments";
import {
  getAvailableSlots,
  bookAppointmentFromChat,
  rejectAppointment,
  getPendingAppointments,
} from "./routes/appointment-slots";
import { handleChat, handleGetChatHistory } from "./routes/chat";
import { connectDB } from "./db";
import { authMiddleware } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Connect to MongoDB
  connectDB().catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  /**
   * @swagger
   * /api/ping:
   *   get:
   *     summary: Health check endpoint
   *     description: Returns a ping message to verify the server is running
   *     tags:
   *       - Health
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: ping
   */
  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.put("/api/auth/update", authMiddleware, handleUpdateProfile);

  // Chat route
  app.post("/api/chat", handleChat);
  app.get("/api/chat/history", handleGetChatHistory);

  // Appointment routes
  // Specific routes MUST come BEFORE generic :id routes
  app.post("/api/appointments", createAppointment);
  app.get("/api/appointments/pending", authMiddleware, getPendingAppointments);
  app.get("/api/appointments/admin/all", authMiddleware, getAllAppointments);
  app.get("/api/appointments/available-slots", getAvailableSlots);
  app.get("/api/appointments/user/my-appointments", handleGetUserAppointments);
  app.get("/api/appointments/patient/appointments", handleGetPatientAppointments);
  app.get("/api/appointments/patient/details", handleGetPatientDetails);
  app.post("/api/appointments/book-from-chat", bookAppointmentFromChat);
  app.post("/api/appointments/update-from-chat", handleUpdateAppointmentFromChat);
  app.post("/api/appointments/approve", handleApproveAppointment);
  app.post("/api/appointments/cancel", handleCancelAppointment);
  app.post("/api/appointments/set-reminder", handleSetReminder);
  app.patch("/api/appointments/:id/confirm", authMiddleware, confirmAppointment);
  app.patch("/api/appointments/:id/reject", authMiddleware, rejectAppointment);
  // Generic :id routes come LAST
  app.get("/api/appointments", authMiddleware, getAppointments);
  app.get("/api/appointments/:id", authMiddleware, getAppointmentById);
  app.put("/api/appointments/:id", authMiddleware, updateAppointment);
  app.delete("/api/appointments/:id", authMiddleware, cancelAppointment);

  return app;
}
