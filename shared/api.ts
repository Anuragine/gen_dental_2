/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Chat request/response types
 */
export interface ChatRequest {
  message: string;
  sessionId?: string;
  userEmail?: string;
  userRole?: "user" | "admin";
}

export interface ChatResponse {
  message: string;
  sessionId: string;
}

/**
 * Authentication types
 */
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
}

/**
 * Appointment types
 */
export interface CreateAppointmentRequest {
  name: string;
  email: string;
  phoneNumber: string;
  date: string;
  time: string;
  service: string;
  dentistName?: string;
  notes?: string;
}

export interface AppointmentResponse {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  time: string;
  service: string;
  dentistName?: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}
