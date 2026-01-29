import { RequestHandler } from "express";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import ChatHistory from "../models/ChatHistory";
import { User } from "../models/User";
import { readFileSync } from "fs";
import { join } from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load clinic knowledge base
let clinicKnowledge: string = "";
try {
  const knowledgePath = join(__dirname, "../clinic-knowledge.json");
  const knowledgeData = JSON.parse(readFileSync(knowledgePath, "utf-8"));
  clinicKnowledge = JSON.stringify(knowledgeData, null, 2);
} catch (error) {
  console.warn("Could not load clinic knowledge base:", error);
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  userEmail?: string;
  userRole?: "user" | "admin";
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Generate unique session ID
const generateSessionId = (): string => {
  return `session_${uuidv4()}`;
};

// Get role-specific system prompt
const getRoleSpecificSystemPrompt = (
  role: "user" | "admin",
  isLoggedIn: boolean
): string => {
  if (role === "admin") {
    return `You are an AI Assistant for the Clinic Admin Dashboard. You help administrators with:
1. Viewing and managing appointment schedules
2. Accessing patient details and contact information
3. Checking appointment status and payment information
4. Generating reports on clinic operations
5. Managing clinic settings and information

When an admin asks about appointments or patients, provide detailed information from the database if available.
Always be professional and helpful.

${clinicKnowledge}`;
  }

  // Logged-in user prompt
  if (isLoggedIn) {
    return `You are a helpful and friendly dental clinic chatbot. Your role is to:
1. Answer questions about our dental services and treatments
2. Help patients understand dental procedures and pricing
3. Assist with appointment booking (use the 'book' command format: book [service] on [date] at [time])
4. Help modify existing appointments
5. Offer general dental health advice
6. Answer frequently asked questions about our clinic

Be professional, empathetic, and informative. Help patients use the booking system.
When patients want to book: remind them to use the format: book [service] on [YYYY-MM-DD] at [HH:MM]

${clinicKnowledge}`;
  }

  // Anonymous user prompt - MUST LOGIN TO BOOK
  return `You are a helpful and friendly dental clinic chatbot on our website.

IMPORTANT: You do NOT handle appointment bookings. Users MUST login first to book appointments.

Your role is to:
1. Answer questions about our dental services and treatments
2. Explain dental procedures and pricing
3. Answer frequently asked questions about our clinic
4. Offer general dental health advice
5. REDIRECT users to login if they want to book appointments

When a user asks about booking an appointment, ALWAYS respond with:
"To book an appointment, please login or register first using the login/register commands."
Then ask: "Would you like to login or register?"

Never pretend to book appointments or ask for appointment details from non-logged-in users.
Be friendly but firm about the login requirement.

${clinicKnowledge}`;
};

// Handle special commands
const handleSpecialCommands = async (
  input: string,
  userEmail?: string,
  userRole?: "user" | "admin"
): Promise<string | null> => {
  const lowerInput = input.toLowerCase().trim();

  // Hide auth commands for anonymous users in homepage chat
  const isAnonymous = !userEmail;

  // Handle incomplete login command (only show to anonymous users)
  if (lowerInput === "login" || lowerInput.startsWith("login ")) {
    if (isAnonymous) {
      if (lowerInput === "login") {
        return `❌ Please provide your login credentials in this format:\n\n\`login [email@example.com] [password]\`\n\nExample:\n\`login john@gmail.com password123\``;
      }

      const parts = lowerInput.split(" ");
      if (parts.length < 3) {
        return `❌ Incomplete login command. Please provide both email and password:\n\n\`login [email@example.com] [password]\``;
      }

      const email = parts[1];
      const password = parts.slice(2).join(" ");

      try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.token) {
          return `✅ Login successful! Welcome ${data.user.name}! 🎉\n\nYou can now book appointments and access your dashboard.`;
        } else {
          return `❌ Login failed: ${data.error || "Invalid credentials"}`;
        }
      } catch (error) {
        return `❌ Login error: Unable to connect to server`;
      }
    } else {
      return `ℹ️ You are already logged in as ${userEmail}`;
    }
  }

  // Handle incomplete register command (only show to anonymous users)
  if (lowerInput === "register" || lowerInput.startsWith("register ")) {
    if (isAnonymous) {
      if (lowerInput === "register") {
        return `❌ Please provide registration details in this format:\n\n\`register [name] [email@example.com] [password]\`\n\nExample:\n\`register John Doe john@gmail.com password123\``;
      }

      const parts = lowerInput.split(" ");
      if (parts.length < 4) {
        return `❌ Incomplete registration command. Required format:\n\n\`register [name] [email@example.com] [password]\``;
      }

      const name = parts[1];
      const email = parts[2];
      const password = parts.slice(3).join(" ");

      try {
        const response = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok && data.token) {
          return `✅ Registration successful! Welcome ${name}! 🎉\n\nYour account has been created. You can now book appointments.`;
        } else {
          return `❌ Registration failed: ${data.error || "An error occurred"}`;
        }
      } catch (error) {
        return `❌ Registration error: Unable to connect to server`;
      }
    } else {
      return `ℹ️ You are already logged in. Please logout first to register a new account.`;
    }
  }

  // Handle incomplete book command
  if (lowerInput === "book" || lowerInput.startsWith("book ")) {
    if (lowerInput === "book") {
      return `❌ Please provide appointment details in this format:\n\n\`book [service] on [date] at [time]\`\n\nExample:\n\`book Consultation on 2026-02-15 at 10:00\`\n\nAvailable services: Consultation, Scaling & Polishing, Filling, Crown, etc.`;
    }

    // Parse booking command: "book [service] on [date] at [time]"
    const bookingRegex = /book\s+(.+?)\s+on\s+(\d{4}-\d{2}-\d{2})\s+at\s+([\d:]+\s*(?:AM|PM)?)/i;
    const match = lowerInput.match(bookingRegex);

    if (!match) {
      return `❌ Invalid format. Please use:\n\n\`book [service] on [date] at [time]\`\n\nExample:\n\`book Consultation on 2026-02-15 at 10:00 AM\``;
    }

    const [, service, date, time] = match;

    // Check if user is logged in
    if (!userEmail) {
      return `❌ Please login first before booking an appointment:\n\n\`login [email] [password]\``;
    }

    try {
      // Get user info
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return `❌ User not found. Please login again.`;
      }

      // Book appointment
      const response = await fetch("http://localhost:8080/api/appointments/book-from-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          service: service.trim(),
          date,
          time: time.trim(),
          userName: user.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return `✅ ${data.message}\n\n📅 Details:\n- Service: ${service.trim()}\n- Date: ${date}\n- Time: ${time.trim()}\n\nWe'll send you a confirmation soon!`;
      } else {
        return `❌ Booking failed: ${data.error || "Please try again"}`;
      }
    } catch (error) {
      return `❌ Booking error: Unable to connect to server. Please try again.`;
    }
  }

  // Admin-specific commands
  if (userRole === "admin") {
    // Get patient details
    if (lowerInput.startsWith("patient ")) {
      const patientEmail = lowerInput.substring(8).trim();
      if (!patientEmail) {
        return `❌ Please specify patient email:\n\n\`patient [email@example.com]\``;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/appointments/patient/details?email=${encodeURIComponent(patientEmail)}`,
          { headers: { "Content-Type": "application/json" } }
        );

        const data = await response.json();
        if (response.ok) {
          return `👤 **Patient Details:**\n\nName: ${data.patient.name}\nEmail: ${data.patient.email}\n\n📅 **Recent Appointments:**\n${data.appointments
            .slice(0, 5)
            .map(
              (apt: any) =>
                `- ${apt.service} on ${new Date(apt.date).toLocaleDateString()} at ${apt.time} (${apt.status})`
            )
            .join("\n")}`;
        } else {
          return `❌ Patient not found`;
        }
      } catch (error) {
        return `❌ Error fetching patient details`;
      }
    }

    // Approve appointment
    if (lowerInput.startsWith("approve ")) {
      const appointmentId = lowerInput.substring(8).trim();
      if (!appointmentId) {
        return `❌ Please specify appointment ID:\n\n\`approve [appointment_id]\``;
      }

      try {
        const response = await fetch("http://localhost:8080/api/appointments/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId,
            approvalMessage: "Your appointment has been approved by the doctor",
          }),
        });

        const data = await response.json();
        if (response.ok) {
          return `✅ Appointment ${appointmentId} approved!\n\n📅 Details:\n- Patient: ${data.appointment.userName}\n- Service: ${data.appointment.service}\n- Date: ${new Date(data.appointment.date).toLocaleDateString()}\n- Time: ${data.appointment.time}`;
        } else {
          return `❌ Failed to approve appointment: ${data.error}`;
        }
      } catch (error) {
        return `❌ Error approving appointment`;
      }
    }

    // Cancel appointment
    if (lowerInput.startsWith("cancel ")) {
      const appointmentId = lowerInput.substring(7).trim();
      if (!appointmentId) {
        return `❌ Please specify appointment ID:\n\n\`cancel [appointment_id]\``;
      }

      try {
        const response = await fetch("http://localhost:8080/api/appointments/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId,
            cancellationReason: "Cancelled by doctor",
          }),
        });

        const data = await response.json();
        if (response.ok) {
          return `✅ Appointment ${appointmentId} cancelled!\n\nPatient ${data.appointment.userName} has been notified.`;
        } else {
          return `❌ Failed to cancel appointment: ${data.error}`;
        }
      } catch (error) {
        return `❌ Error cancelling appointment`;
      }
    }

    // Set reminder
    if (lowerInput.startsWith("remind ")) {
      const parts = lowerInput.substring(7).split(" on ");
      if (parts.length < 2) {
        return `❌ Please specify appointment ID and reminder date:\n\n\`remind [appointment_id] on [YYYY-MM-DD HH:MM]\``;
      }

      const appointmentId = parts[0].trim();
      const reminderDate = parts[1].trim();

      try {
        const response = await fetch("http://localhost:8080/api/appointments/set-reminder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId,
            reminderDate: new Date(reminderDate),
          }),
        });

        const data = await response.json();
        if (response.ok) {
          return `✅ Reminder set for appointment ${appointmentId}!\n\nYou will be reminded on: ${new Date(reminderDate).toLocaleString()}`;
        } else {
          return `❌ Failed to set reminder: ${data.error}`;
        }
      } catch (error) {
        return `❌ Error setting reminder`;
      }
    }
  }

  // Handle help command
  if (lowerInput === "help") {
    if (userRole === "admin") {
      return `📚 **Doctor Commands:**\n\n\`patient [email]\` - View patient details\n\`approve [appointment_id]\` - Approve appointment\n\`cancel [appointment_id]\` - Cancel appointment\n\`remind [appointment_id] on [YYYY-MM-DD HH:MM]\` - Set reminder\n\nOr ask me any questions about your patients!`;
    } else if (userEmail) {
      return `📚 **Available Commands:**\n\n\`book [service] on [date] at [time]\` - Book appointment\n\`logout\` - Logout\n\nOr ask me any questions about our services!`;
    } else {
      return `📚 **Available Commands:**\n\n\`login [email] [password]\` - Login to your account\n\`register [name] [email] [password]\` - Create new account\n\nOr ask me any questions about our services! 😊`;
    }
  }

  // Handle logout command
  if (lowerInput === "logout") {
    return `👋 You have been logged out. You can login again anytime!`;
  }

  return null;
};

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { message, sessionId: providedSessionId, userEmail, userRole } = req.body as ChatRequest;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Generate or use existing session ID
    const sessionId = providedSessionId || generateSessionId();

    // Get user role from database if email provided
    let actualRole: "user" | "admin" = userRole || "user";
    if (userEmail) {
      try {
        const user = await User.findOne({ email: userEmail });
        if (user && (user as any).role) {
          actualRole = (user as any).role;
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    }

    // Check for special commands first
    const commandResponse = await handleSpecialCommands(message, userEmail, actualRole);
    if (commandResponse) {
      // Save to chat history
      try {
        await ChatHistory.findOneAndUpdate(
          { sessionId },
          {
            $push: {
              messages: [
                { role: "user", content: message, timestamp: new Date() },
                {
                  role: "assistant",
                  content: commandResponse,
                  timestamp: new Date(),
                },
              ],
            },
            userEmail: userEmail || undefined,
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error("Error saving to chat history:", error);
      }

      res.json({
        message: commandResponse,
        sessionId,
      });
      return;
    }

    // Retrieve chat history for context
    let chatHistory: ChatMessage[] = [];
    try {
      const history = await ChatHistory.findOne({ sessionId });
      if (history && history.messages) {
        chatHistory = history.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
      }
    } catch (error) {
      console.error("Error retrieving chat history:", error);
    }

    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: message,
      },
    ];

    // Add previous messages for context (limit to last 10 to avoid token limits)
    if (chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-10);
      messages.unshift(...recentHistory);
    }

    // Get role-specific system prompt
    const systemPrompt = getRoleSpecificSystemPrompt(actualRole, !!userEmail);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage =
      response.choices[0]?.message?.content || "Sorry, I could not generate a response.";

    // Save to chat history
    try {
      await ChatHistory.findOneAndUpdate(
        { sessionId },
        {
          $push: {
            messages: [
              { role: "user", content: message, timestamp: new Date() },
              {
                role: "assistant",
                content: assistantMessage,
                timestamp: new Date(),
              },
            ],
          },
          userEmail: userEmail || undefined,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error("Error saving to chat history:", error);
    }

    res.json({
      message: assistantMessage,
      sessionId,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to process chat message",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get chat history for a user
 */
export const handleGetChatHistory: RequestHandler = async (req, res) => {
  try {
    const userEmail = req.query.email as string;

    if (!userEmail) {
      res.status(400).json({ error: "User email is required" });
      return;
    }

    // Find the most recent chat session for this user
    const chatHistory = await ChatHistory.findOne({ userEmail }).sort({
      createdAt: -1,
    });

    if (!chatHistory) {
      res.json({
        message: "No previous chat history found",
        messages: [],
        sessionId: null,
      });
      return;
    }

    res.json({
      message: "Chat history retrieved successfully",
      messages: chatHistory.messages,
      sessionId: chatHistory.sessionId,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      error: "Failed to fetch chat history",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
