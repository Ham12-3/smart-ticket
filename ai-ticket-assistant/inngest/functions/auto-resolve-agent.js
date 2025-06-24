import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const autoResolveAgent = inngest.createFunction(
  { id: "auto-resolve-agent", retries: 2 },
  { event: "ticket/auto-resolve-check" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // Fetch ticket details
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId).populate("createdBy", "email");
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      // AI Auto-Resolution Attempt
      const resolutionAttempt = await step.run("ai-auto-resolution", async () => {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          const prompt = `You are an AI support agent. Analyze this ticket and determine if you can provide a complete solution.

RULES:
1. Only provide solutions for simple, common issues (password resets, account setup, basic troubleshooting)
2. If the issue requires human intervention, investigation, or is complex, respond with "REQUIRES_HUMAN"
3. If you can provide a complete solution, provide detailed step-by-step instructions

Respond with JSON:
{
  "canResolve": true/false,
  "solution": "Step-by-step solution if canResolve is true, or 'REQUIRES_HUMAN'",
  "confidence": 0-100,
  "category": "auto-resolved" or "escalate-to-human"
}

Ticket:
Title: ${ticket.title}
Description: ${ticket.description}`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          
          const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
          return JSON.parse(cleanedText);
        } catch (error) {
          console.error("AI resolution error:", error);
          return { canResolve: false, solution: "REQUIRES_HUMAN", confidence: 0, category: "escalate-to-human" };
        }
      });

      if (resolutionAttempt.canResolve && resolutionAttempt.confidence > 80) {
        // Auto-resolve the ticket
        await step.run("auto-resolve-ticket", async () => {
          await Ticket.findByIdAndUpdate(ticket._id, {
            status: "RESOLVED_BY_AI",
            helpfulNotes: `🤖 AI Agent Resolution:\n\n${resolutionAttempt.solution}`,
            resolvedAt: new Date(),
            resolvedBy: "AI_AGENT"
          });
        });

        // Send resolution email to user
        await step.run("send-resolution-email", async () => {
          const subject = `✅ Your Ticket Has Been Resolved - ${ticket.title}`;
          const message = `Hi there!

Great news! Our AI agent was able to resolve your support ticket automatically.

Ticket: ${ticket.title}

Solution:
${resolutionAttempt.solution}

If this doesn't solve your issue or you need further assistance, simply reply to this email or create a new ticket.

Best regards,
Smart Ticket AI Agent`;

          await sendMail(ticket.createdBy.email, subject, message);
        });

        return { 
          success: true, 
          action: "auto-resolved",
          confidence: resolutionAttempt.confidence
        };
      } else {
        // Escalate to human with AI insights
        await step.run("escalate-with-insights", async () => {
          await Ticket.findByIdAndUpdate(ticket._id, {
            status: "ESCALATED_TO_HUMAN",
            helpfulNotes: `🤖 AI Agent Analysis:\n\nThis ticket requires human attention.\n\nAI Insights: ${resolutionAttempt.solution}\n\nConfidence: ${resolutionAttempt.confidence}%`
          });
        });

        // Trigger normal assignment flow
        await step.run("trigger-human-assignment", async () => {
          await inngest.send({
            name: "ticket/created",
            data: { ticketId: ticket._id.toString() }
          });
        });

        return { 
          success: true, 
          action: "escalated-to-human",
          reason: resolutionAttempt.solution
        };
      }

    } catch (err) {
      console.error("❌ Error in auto-resolve agent", err.message);
      return { success: false, error: err.message };
    }
  }
); 