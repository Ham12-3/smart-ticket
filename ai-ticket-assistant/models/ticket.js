import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, default: "TODO" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  priority: String,
  deadline: Date,
  helpfulNotes: String,
  relatedSkills: [String],
  createdAt: { type: Date, default: Date.now },
  // Agentic features
  resolvedAt: Date,
  resolvedBy: String, // "AI_AGENT" or user ID
  escalatedAt: Date,
  escalationReason: String,
  satisfactionSurveySent: { type: Boolean, default: false },
  satisfactionRating: String,
  autoResolutionAttempted: { type: Boolean, default: false },
  followupSent: { type: Boolean, default: false }
});

export default mongoose.model("Ticket", ticketSchema);