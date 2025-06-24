import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { sendMail } from "../../utils/mailer.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const smartEscalationAgent = inngest.createFunction(
  { id: "smart-escalation-agent", retries: 2 },
  { event: "ticket/monitor-escalation" },
  async ({ event, step }) => {
    try {
      const { ticketId, checkAfterHours = 48 } = event.data;

      // Wait for the monitoring period
      await step.sleep("wait-for-escalation-check", `${checkAfterHours}h`);

      // Fetch current ticket status
      const ticket = await step.run("fetch-ticket-status", async () => {
        return await Ticket.findById(ticketId).populate("assignedTo", "email name").populate("createdBy", "email name");
      });

      if (!ticket || ticket.status === "DONE" || ticket.status === "RESOLVED_BY_AI") {
        return { success: true, action: "no-escalation-needed" };
      }

      // Analyze escalation need
      const escalationAnalysis = await step.run("analyze-escalation-need", async () => {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          const hoursOpen = Math.floor((new Date() - new Date(ticket.createdAt)) / (1000 * 60 * 60));
          
          const prompt = `You are an AI escalation manager. Analyze this ticket and determine if escalation is needed.

Current Situation:
- Ticket Title: ${ticket.title}
- Priority: ${ticket.priority}
- Status: ${ticket.status}
- Hours Open: ${hoursOpen}
- Assigned To: ${ticket.assignedTo ? ticket.assignedTo.name : "Unassigned"}
- Description: ${ticket.description}

Escalation Rules:
- High priority: Escalate after 24 hours without resolution
- Medium priority: Escalate after 48 hours without resolution  
- Low priority: Escalate after 72 hours without resolution
- Always escalate if unassigned after 12 hours

Respond with JSON:
{
  "shouldEscalate": true/false,
  "urgencyLevel": "low" | "medium" | "high" | "critical",
  "escalationReason": "Detailed reason for escalation",
  "recommendedActions": ["Action 1", "Action 2"],
  "suggestedAssignee": "admin" | "senior-moderator" | "specialist"
}`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          
          const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
          return JSON.parse(cleanedText);
        } catch (error) {
          console.error("Escalation analysis error:", error);
          return {
            shouldEscalate: true,
            urgencyLevel: "medium",
            escalationReason: "Ticket monitoring period expired",
            recommendedActions: ["Review ticket", "Assign to admin"],
            suggestedAssignee: "admin"
          };
        }
      });

      if (escalationAnalysis.shouldEscalate) {
        // Find appropriate escalation target
        const escalationTarget = await step.run("find-escalation-target", async () => {
          let target;
          
          if (escalationAnalysis.suggestedAssignee === "admin") {
            target = await User.findOne({ role: "admin" });
          } else {
            // Find most suitable moderator
            target = await User.findOne({ 
              role: "moderator",
              skills: { $in: ticket.relatedSkills || [] }
            });
          }
          
          if (!target) {
            target = await User.findOne({ role: "admin" });
          }
          
          return target;
        });

        // Update ticket with escalation
        await step.run("escalate-ticket", async () => {
          await Ticket.findByIdAndUpdate(ticket._id, {
            status: "ESCALATED",
            priority: escalationAnalysis.urgencyLevel === "critical" ? "high" : ticket.priority,
            assignedTo: escalationTarget._id,
            escalatedAt: new Date(),
            escalationReason: escalationAnalysis.escalationReason,
            helpfulNotes: `${ticket.helpfulNotes || ""}\n\n🚨 ESCALATED: ${escalationAnalysis.escalationReason}\n\nRecommended Actions:\n${escalationAnalysis.recommendedActions.map(action => `- ${action}`).join('\n')}`
          });
        });

        // Notify escalation target
        await step.run("notify-escalation-target", async () => {
          const subject = `🚨 ESCALATED TICKET: ${ticket.title}`;
          const message = `A ticket has been escalated to you for immediate attention.

Ticket Details:
- Title: ${ticket.title}
- Priority: ${escalationAnalysis.urgencyLevel.toUpperCase()}
- Customer: ${ticket.createdBy.email}
- Open Since: ${new Date(ticket.createdAt).toLocaleString()}

Escalation Reason:
${escalationAnalysis.escalationReason}

Recommended Actions:
${escalationAnalysis.recommendedActions.map(action => `• ${action}`).join('\n')}

Please review and take action immediately.

Ticket ID: ${ticket._id}`;

          await sendMail(escalationTarget.email, subject, message);
        });

        // Notify customer about escalation
        await step.run("notify-customer-escalation", async () => {
          const subject = `Update on your support ticket - ${ticket.title}`;
          const message = `Hi ${ticket.createdBy.name || 'there'},

We want to keep you informed about your support ticket.

Your ticket has been escalated to ensure you receive the best possible assistance. A senior team member will be reviewing your case and will respond shortly.

We appreciate your patience and are committed to resolving this quickly.

Ticket: ${ticket.title}
Status: Escalated to Senior Support

Best regards,
Smart Ticket System`;

          await sendMail(ticket.createdBy.email, subject, message);
        });

        return {
          success: true,
          action: "escalated",
          urgencyLevel: escalationAnalysis.urgencyLevel,
          assignedTo: escalationTarget.email
        };
      }

      return { success: true, action: "no-escalation-needed" };

    } catch (err) {
      console.error("❌ Error in smart escalation agent", err.message);
      return { success: false, error: err.message };
    }
  }
);

export const stallDetectionAgent = inngest.createFunction(
  { id: "stall-detection-agent", retries: 2 },
  { event: "ticket/check-stalled-tickets" },
  async ({ event, step }) => {
    try {
      // Find potentially stalled tickets
      const stalledTickets = await step.run("find-stalled-tickets", async () => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        return await Ticket.find({
          status: { $in: ["TODO", "IN_PROGRESS"] },
          createdAt: { $lt: twentyFourHoursAgo },
          escalatedAt: { $exists: false }
        }).populate("assignedTo", "email").populate("createdBy", "email");
      });

      // Process each stalled ticket
      for (const ticket of stalledTickets) {
        await step.run(`process-stalled-ticket-${ticket._id}`, async () => {
          await inngest.send({
            name: "ticket/monitor-escalation",
            data: { 
              ticketId: ticket._id.toString(),
              checkAfterHours: 0 // Immediate check for already stalled tickets
            }
          });
        });
      }

      return {
        success: true,
        stalledTicketsFound: stalledTickets.length,
        processedTickets: stalledTickets.map(t => t._id)
      };

    } catch (err) {
      console.error("❌ Error in stall detection agent", err.message);
      return { success: false, error: err.message };
    }
  }
); 