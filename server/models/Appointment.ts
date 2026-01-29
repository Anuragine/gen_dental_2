import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  date: Date;
  time: string;
  service: string;
  dentistName?: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  phoneNumber?: string;
  approvalMessage?: string;
  rejectionReason?: string;
  reminderSet?: boolean;
  reminderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
      enum: [
        "Anterior Tooth Fracture Repair",
        "BPS Denture",
        "Bridge Recementation",
        "Bruxzir Crown",
        "CAD CAM PFM Crown",
        "Cast Partial Denture",
        "Cast RPD Additional Tooth",
        "Ceramic Braces",
        "Ceramic Laminates",
        "Clear Aligners",
        "CLP / Perio Surgeries",
        "Co-Cr Metal Crown",
        "Composite Filling",
        "Composite Laminates",
        "Consultant Doctor",
        "Consultation",
        "Crown Recementation",
        "Dental Bleaching",
        "Dental Implant",
        "Denture Repair",
        "Depigmentation",
        "Diastema Closure",
        "Digital X-ray",
        "Disimpaction Surgery",
        "Fiber Glass Denture",
        "Firm Tooth Extraction",
        "Flap Surgery",
        "Flexible Denture",
        "Flexible RPD",
        "Fluoride Application",
        "Follow Up",
        "Fracture Mandible Treatment",
        "GIC Filling",
        "Gingivectomy",
        "Imported Lucitone Denture",
        "IOPA Film X-ray",
        "Lava/Procera/E-max Crown",
        "Lucitone Denture",
        "Metal Braces",
        "Minor Surgical Procedure",
        "Mobile Tooth Extraction",
        "Ni-Cr Metal Crown",
        "Night Guard / Mouth Guard",
        "Non-Surgical Perio Therapy",
        "Pediatric Restorations",
        "PFM Crown",
        "Post & Core",
        "Preformed Metal Crown",
        "Primary Tooth Extraction",
        "Pulpectomy",
        "RCT - Standard",
        "Removable Appliance",
        "Repeat RCT",
        "RPD Additional Tooth",
        "RPD Single Tooth",
        "Scaling & Polishing",
        "Silver Filling",
        "Space Maintainer",
        "Standard Acrylic Denture",
        "Strip Crown (Anterior)",
        "Surgical Extraction",
        "Temporary Crown",
        "Third Molar RCT",
        "Zirconia Crown",
        "Zirconia Crown (Pediatric)",
      ],
    },
    dentistName: {
      type: String,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    approvalMessage: {
      type: String,
      required: false,
    },
    rejectionReason: {
      type: String,
      required: false,
    },
    reminderSet: {
      type: Boolean,
      default: false,
    },
    reminderDate: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
appointmentSchema.index({ userId: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

export const Appointment = mongoose.models.User_Appointments || mongoose.model<IAppointment>(
  "User_Appointments",
  appointmentSchema,
  "User_Appointments"
);
