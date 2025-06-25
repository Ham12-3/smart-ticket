import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { createTicket, getTicket, getTickets, updateTicket } from "../controllers/ticket.js";

const router = express.Router();

router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.post("/", authenticate, createTicket);
router.put("/:id", authenticate, updateTicket);

// Debug endpoint to check authentication
router.get("/debug/auth", authenticate, (req, res) => {
  res.json({ 
    message: "Authentication working", 
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

export default router;