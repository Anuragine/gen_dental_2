import mongoose, { Schema, Document } from "mongoose";

export interface IChatHistory extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  sessionId: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const chatHistorySchema = new Schema<IChatHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    userEmail: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
chatHistorySchema.index({ userEmail: 1, createdAt: -1 });
chatHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

export default mongoose.models.ChatHistory || mongoose.model<IChatHistory>("ChatHistory", chatHistorySchema);
