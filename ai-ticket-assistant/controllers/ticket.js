import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });
    
    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { status, notes, assignedTo } = req.body;
    const ticketId = req.params.id;
    const user = req.user;

    console.log("=== UPDATE TICKET DEBUG ===");
    console.log("Ticket ID:", ticketId);
    console.log("Update data:", { status, notes, assignedTo });
    console.log("User role:", user.role);

    // Only moderators and admins can update tickets
    if (user.role === "user") {
      return res.status(403).json({ message: "Forbidden: Users cannot update tickets" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    console.log("Original ticket status:", ticket.status);

    const updateData = {};
    
    if (status) {
      updateData.status = status;
      console.log("Setting new status to:", status);
      
      // If marking as resolved
      if (status === "done") {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = user._id.toString();
        console.log("Marking ticket as resolved");
      }
    }
    
    if (notes) {
      updateData.helpfulNotes = notes;
    }
    
    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }

    console.log("Final update data:", updateData);

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId, 
      updateData, 
      { new: true }
    ).populate("assignedTo", ["email", "_id"]);

    console.log("Updated ticket status:", updatedTicket.status);

    return res.status(200).json({
      message: "Ticket updated successfully",
      ticket: updatedTicket,
      debug: {
        originalStatus: ticket.status,
        newStatus: updatedTicket.status,
        updateData
      }
    });
  } catch (error) {
    console.error("Error updating ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];
    
    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    }
    
    return res.status(200).json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    console.log("=== GET TICKET DEBUG ===");
    console.log("User role:", user.role);
    console.log("Ticket ID:", req.params.id);
    console.log("User ID:", user._id);

    if (user.role !== "user") {
      console.log("User is admin/moderator - fetching any ticket");
      ticket = await Ticket.findById(req.params.id).populate("assignedTo", [
        "email",
        "_id",
      ]);
    } else {
      console.log("User is regular user - fetching only their tickets");
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      });
    }

    console.log("Found ticket:", ticket ? "Yes" : "No");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found or access denied" });
    }
    
    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};