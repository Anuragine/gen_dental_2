import { RequestHandler } from "express";
import { Appointment } from "../models/Appointment";
import { User } from "../models/User";
import { JWTPayload } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

interface CreateAppointmentBody {
  name: string;
  email: string;
  phoneNumber: string;
  date: string;
  time: string;
  service: string;
  dentistName?: string;
  notes?: string;
}

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     description: Book a new dental appointment
 *     tags:
 *       - Appointments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phoneNumber
 *               - date
 *               - time
 *               - service
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               service:
 *                 type: string
 *               dentistName:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
export const createAppointment: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      date,
      time,
      service,
      dentistName,
      notes,
    } = req.body as CreateAppointmentBody;

    // Validation
    if (!name || !email || !phoneNumber || !date || !time || !service) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Check if user exists, if not create one
    let user = await User.findOne({ email });
    let userId = user?._id;

    if (!user) {
      // Create a new user if they don't exist
      user = new User({
        email,
        name,
        password: "temp-password", // User will need to set a real password later
      });
      await user.save();
      userId = user._id;
    }

    // Create appointment
    // Handle date format: expect YYYY-MM-DD and convert to Date at start of day
    const dateStr = typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0];
    const [year, month, day] = dateStr.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day);

    const appointment = new Appointment({
      userId,
      userName: name,
      userEmail: email,
      phoneNumber,
      date: appointmentDate,
      time,
      service,
      dentistName: dentistName || undefined,
      notes: notes || undefined,
      status: "pending",
    });

    await appointment.save();

    res.status(201).json({
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      message: "Failed to create appointment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get user appointments
 *     description: Retrieve all appointments for the authenticated user
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getAppointments: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const appointments = await Appointment.find({
      userId: req.user.userId,
    }).sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      message: "Failed to fetch appointments",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     description: Retrieve a specific appointment
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
export const getAppointmentById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({
      message: "Failed to fetch appointment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     description: Update appointment details or status
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               dentistName:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
export const updateAppointment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const appointment = await Appointment.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      message: "Failed to update appointment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Cancel appointment
 *     description: Cancel an appointment
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
export const cancelAppointment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      message: "Failed to cancel appointment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @swagger
 * /api/appointments/admin/all:
 *   get:
 *     summary: Get all appointments (Admin)
 *     description: Retrieve all appointments for admin panel
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all appointments
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getAllAppointments: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // TODO: Add admin role check when user roles are implemented
    const appointments = await Appointment.find({}).sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    res.status(500).json({
      message: "Failed to fetch appointments",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @swagger
 * /api/appointments/{id}/confirm:
 *   patch:
 *     summary: Confirm an appointment
 *     description: Admin can confirm a pending appointment
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approvalMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment confirmed
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
export const confirmAppointment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalMessage } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status: "confirmed",
        approvalMessage: approvalMessage || undefined,
      },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    res.status(200).json({
      message: "Appointment confirmed successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error confirming appointment:", error);
    res.status(500).json({
      message: "Failed to confirm appointment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @swagger
 * /api/appointments/{id}/reject:
 *   patch:
 *     summary: Reject an appointment
 *     description: Admin can reject a pending appointment
 *     tags:
 *       - Appointments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejectionReason
 *             properties:
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment rejected
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
export const rejectAppointment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      res.status(400).json({ message: "Rejection reason is required" });
      return;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status: "cancelled",
        rejectionReason,
      },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    res.status(200).json({
      message: "Appointment rejected successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    res.status(500).json({
      message: "Failed to reject appointment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get user's appointments
 */
export const handleGetUserAppointments: RequestHandler = async (req, res) => {
  try {
    const userEmail = req.query.email as string;

    if (!userEmail) {
      res.status(400).json({ error: "User email is required" });
      return;
    }

    const appointments = await Appointment.find({ userEmail }).sort({ date: -1 });

    res.json({
      message: "User appointments retrieved successfully",
      appointments,
    });
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({
      error: "Failed to fetch user appointments",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update appointment from chat
 */
export const handleUpdateAppointmentFromChat: RequestHandler = async (req, res) => {
  try {
    const { appointmentId, userEmail, date, time, service, notes } = req.body;

    if (!appointmentId || !userEmail) {
      res.status(400).json({ error: "Appointment ID and user email are required" });
      return;
    }

    const updateData: any = {};
    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;
    if (service) updateData.service = service;
    if (notes) updateData.notes = notes;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, userEmail },
      updateData,
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment from chat:", error);
    res.status(500).json({
      error: "Failed to update appointment",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Approve appointment (doctor action)
 */
export const handleApproveAppointment: RequestHandler = async (req, res) => {
  try {
    const { appointmentId, approvalMessage } = req.body;

    if (!appointmentId) {
      res.status(400).json({ error: "Appointment ID is required" });
      return;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: "confirmed",
        approvalMessage: approvalMessage || "Your appointment has been approved",
      },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json({
      message: "Appointment approved successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error approving appointment:", error);
    res.status(500).json({
      error: "Failed to approve appointment",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Cancel appointment (doctor action)
 */
export const handleCancelAppointment: RequestHandler = async (req, res) => {
  try {
    const { appointmentId, cancellationReason } = req.body;

    if (!appointmentId) {
      res.status(400).json({ error: "Appointment ID is required" });
      return;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: "cancelled",
        rejectionReason: cancellationReason || "Appointment cancelled by doctor",
      },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      error: "Failed to cancel appointment",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Set reminder for appointment
 */
export const handleSetReminder: RequestHandler = async (req, res) => {
  try {
    const { appointmentId, reminderDate } = req.body;

    if (!appointmentId || !reminderDate) {
      res.status(400).json({ error: "Appointment ID and reminder date are required" });
      return;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        reminderSet: true,
        reminderDate: new Date(reminderDate),
      },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json({
      message: "Reminder set successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error setting reminder:", error);
    res.status(500).json({
      error: "Failed to set reminder",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all patient appointments (doctor only)
 */
export const handleGetPatientAppointments: RequestHandler = async (req, res) => {
  try {
    const patientEmail = req.query.email as string;

    if (!patientEmail) {
      res.status(400).json({ error: "Patient email is required" });
      return;
    }

    const appointments = await Appointment.find({ userEmail: patientEmail }).sort({ date: -1 });

    res.json({
      message: "Patient appointments retrieved successfully",
      appointments,
    });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({
      error: "Failed to fetch patient appointments",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get patient details (doctor only)
 */
export const handleGetPatientDetails: RequestHandler = async (req, res) => {
  try {
    const patientEmail = req.query.email as string;

    if (!patientEmail) {
      res.status(400).json({ error: "Patient email is required" });
      return;
    }

    const patient = await User.findOne({ email: patientEmail }).select("-password");

    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    const appointments = await Appointment.find({ userEmail: patientEmail }).sort({ date: -1 });

    res.json({
      message: "Patient details retrieved successfully",
      patient,
      appointments,
    });
  } catch (error) {
    console.error("Error fetching patient details:", error);
    res.status(500).json({
      error: "Failed to fetch patient details",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
