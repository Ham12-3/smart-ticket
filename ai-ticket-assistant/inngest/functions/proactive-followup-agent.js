import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { sendMail } from "../../utils/mailer.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const proactiveFollowupAgent = inngest.createFunction(
  { id: "proactive-followup-agent", retries: 2 },
  { event: "ticket/schedule-followup" },
  async ({ event, step }) => {
    try {
      const { ticketId, delayInHours = 24 } = event.data;

      // Wait for the specified delay
      await step.sleep("wait-for-followup-time", `${delayInHours}h`);

      // Fetch ticket details
      const ticket = await step.run("fetch-ticket-details", async () => {
        return await Ticket.findById(ticketId).populate("createdBy", "email name");
      });

      if (!ticket || ticket.status === "CLOSED") {
        return { success: true, action: "no-followup-needed" };
      }

      // Generate personalized follow-up message
      const followupContent = await step.run("generate-followup", async () => {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          const prompt = `You are a customer success AI agent. Create a personalized, helpful follow-up email for this support ticket.

Guidelines:
- Be warm, professional, and genuinely helpful
- Ask specific questions about their experience
- Offer additional resources if relevant
- Keep it concise but personal
- Include a clear call-to-action

Ticket Details:
- Title: ${ticket.title}
- Status: ${ticket.status}
- Priority: ${ticket.priority}
- Description: ${ticket.description}
- Resolution Notes: ${ticket.helpfulNotes || "No resolution notes available"}

Respond with JSON:
{
  "subject": "Personalized subject line",
  "message": "Complete email message with proper formatting",
  "followupType": "satisfaction-check" | "additional-help" | "educational"
}`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          
          const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
          return JSON.parse(cleanedText);
        } catch (error) {
          console.error("Follow-up generation error:", error);
          return {
            subject: `Following up on your ticket: ${ticket.title}`,
            message: `Hi! We wanted to check in on your recent support ticket. Is everything working well for you now? If you need any additional help, please don't hesitate to reach out!`,
            followupType: "satisfaction-check"
          };
        }
      });

      // Send follow-up email
      await step.run("send-followup-email", async () => {
        const enhancedMessage = `${followupContent.message}

---
Need more help? Simply reply to this email or visit our support portal.

Best regards,
Smart Ticket Success Team

Ticket ID: ${ticket._id}`;

        await sendMail(ticket.createdBy.email, followupContent.subject, enhancedMessage);
      });

      // Schedule satisfaction survey if not sent yet
      if (!ticket.satisfactionSurveySent) {
        await step.run("schedule-satisfaction-survey", async () => {
          await inngest.send({
            name: "ticket/send-satisfaction-survey",
            data: { ticketId: ticket._id.toString() }
          });
        });

        await step.run("mark-survey-scheduled", async () => {
          await Ticket.findByIdAndUpdate(ticket._id, {
            satisfactionSurveySent: true
          });
        });
      }

      return { 
        success: true, 
        action: "followup-sent",
        followupType: followupContent.followupType
      };

    } catch (err) {
      console.error("❌ Error in proactive followup agent", err.message);
      return { success: false, error: err.message };
    }
  }
);

export const satisfactionSurveyAgent = inngest.createFunction(
  { id: "satisfaction-survey-agent", retries: 2 },
  { event: "ticket/send-satisfaction-survey" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // Wait 3 days before sending satisfaction survey
      await step.sleep("wait-for-survey-time", "72h");

      const ticket = await step.run("fetch-ticket", async () => {
        return await Ticket.findById(ticketId).populate("createdBy", "email name");
      });

      if (!ticket) {
        return { success: false, error: "Ticket not found" };
      }

      await step.run("send-satisfaction-survey", async () => {
        const subject = `How was your support experience? - ${ticket.title}`;
        const message = `Hi ${ticket.createdBy.name || 'there'}!

We hope your recent support issue has been resolved to your satisfaction.

Could you take a moment to rate your experience?

⭐ Excellent (Reply with: EXCELLENT)
⭐ Good (Reply with: GOOD)  
⭐ Fair (Reply with: FAIR)
⭐ Poor (Reply with: POOR)

Your feedback helps us improve our service!

Additional comments are always welcome.

Thank you for using Smart Ticket System!

Ticket: ${ticket.title}
Resolved: ${ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleDateString() : 'Recently'}`;

        await sendMail(ticket.createdBy.email, subject, message);
      });

      return { success: true, action: "satisfaction-survey-sent" };

    } catch (err) {
      console.error("❌ Error in satisfaction survey agent", err.message);
      return { success: false, error: err.message };
    }
  }
); 