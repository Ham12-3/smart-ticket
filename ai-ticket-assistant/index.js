import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { serve } from "inngest/express";
import userRoutes from "./routes/user.js";
import ticketRoutes from "./routes/ticket.js";
import { inngest } from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";
import { autoResolveAgent } from "./inngest/functions/auto-resolve-agent.js";
import { proactiveFollowupAgent, satisfactionSurveyAgent } from "./inngest/functions/proactive-followup-agent.js";
import { smartEscalationAgent } from "./inngest/functions/smart-escalation-agent.js";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/tickets", ticketRoutes);

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [
      onUserSignup, 
      onTicketCreated, 
      autoResolveAgent, 
      proactiveFollowupAgent, 
      satisfactionSurveyAgent, 
      smartEscalationAgent
    ],
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () => console.log(`🚀 Server at http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB error: ", err));