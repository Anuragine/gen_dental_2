import { RequestHandler } from "express";
import { Appointment } from "../models/Appointment";
import { User } from "../models/User";

// Get available appointment slots
export const getAvailableSlots: RequestHandler = async (req, res) => {
  try {
    const { date } = req.query;

    // Define available time slots
    const allSlots = [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM",
      "05:00 PM",
    ];

    let availableSlots = [...allSlots];

    if (date) {
      // Get booked appointments for this date
      const bookedAppointments = await Appointment.find({
        date: new Date(date as string),
      });

      const bookedSlots = bookedAppointments.map((apt) => apt.time);
      availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));
    }

    res.json({
      availableSlots,
      totalSlots: availableSlots.length,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ error: "Failed to fetch available slots" });
  }
};

// Book appointment from chat (LLM)
export const bookAppointmentFromChat: RequestHandler = async (req, res) => {
  try {
    const { userEmail, service, date, time, userName } = req.body;

    if (!userEmail || !service || !date || !time) {
      res.status(400).json({
        error: "Missing required fields: userEmail, service, date, time",
      });
      return;
    }

    // Get user details
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      date: new Date(date),
      time,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      res.status(400).json({
        error: `Time slot ${time} is already booked. Please choose another time.`,
      });
      return;
    }

    // Create appointment
    const appointment = new Appointment({
      userId: user._id,
      userName: userName || user.name,
      userEmail: user.email,
      date: new Date(date),
      time,
      service,
      status: "pending",
      phoneNumber: user.phoneNumber || "",
    });

    await appointment.save();

    res.json({
      success: true,
      message: `✅ Appointment booked! ${service} on ${date} at ${time}. Waiting for dentist approval.`,
      appointment: {
        id: appointment._id,
        service,
        date,
        time,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Error booking appointment from chat:", error);
    res.status(500).json({ error: "Failed to book appointment" });
  }
};

// Approve appointment (dentist action)
export const approveAppointment: RequestHandler = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { approvalMessage } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: "confirmed",
        approvalMessage: approvalMessage || "Your appointment has been confirmed.",
      },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json({
      success: true,
      message: "Appointment approved",
      appointment,
    });
  } catch (error) {
    console.error("Error approving appointment:", error);
    res.status(500).json({ error: "Failed to approve appointment" });
  }
};

// Reject appointment (dentist action)
export const rejectAppointment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status: "cancelled",
        rejectionReason: rejectionReason || "Appointment cancelled by dentist.",
      },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json({
      success: true,
      message: "Appointment rejected",
      appointment,
    });
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    res.status(500).json({ error: "Failed to reject appointment" });
  }
};

// Get pending appointments (for dentist approval)
export const getPendingAppointments: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "No authorization token" });
      return;
    }

    const userEmail = (req as any).userEmail;
    const user = await User.findOne({ email: userEmail });

    // Check if user is dentist/admin
    if (!user || (user as any).role !== "admin") {
      res.status(403).json({ error: "Only dentists can view pending appointments" });
      return;
    }

    const pendingAppointments = await Appointment.find({ status: "pending" }).sort({
      date: 1,
    });

    res.json(pendingAppointments);
  } catch (error) {
    console.error("Error fetching pending appointments:", error);
    res.status(500).json({ error: "Failed to fetch pending appointments" });
  }
};
