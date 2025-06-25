import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, skills });

    // Fire inngest event
    await inngest.send({
      name: "user/signup",
      data: {
        email,
      },
    });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user: { _id: user._id, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", details: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user: { _id: user._id, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", details: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    // If we reach here, the authenticate middleware has already verified the token
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user: { _id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", details: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Unauthorized" });
    });
    
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", details: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.updateOne(
      { email },
      { skills: skills.length ? skills : user.skills, role }
    );
    return res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Update failed", details: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const users = await User.find().select("-password");
    return res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to get users", details: error.message });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Debug logging
    console.log("=== PROMOTE TO ADMIN DEBUG ===");
    console.log("Requester user:", req.user);
    console.log("Email to promote:", email);
    
    // Check if there are any admins in the system
    const adminCount = await User.countDocuments({ role: "admin" });
    const hasNoAdmins = adminCount === 0;
    
    console.log("Admin count in system:", adminCount);
    console.log("Has no admins:", hasNoAdmins);
    console.log("Requester role:", req.user?.role);
    
    // Allow promotion if: no admins exist OR requester is already an admin OR requester is promoting themselves
    const currentUser = await User.findById(req.user._id);
    const isPromotingSelf = currentUser.email === email;
    
    console.log("Current user email:", currentUser.email);
    console.log("Is promoting self:", isPromotingSelf);
    
    // TEMPORARY FIX: Allow anyone to promote themselves during initial setup
    if (!isPromotingSelf && req.user?.role !== "admin") {
      return res.status(403).json({ 
        message: "You can only promote yourself or be an existing admin",
        debug: {
          hasNoAdmins,
          requesterRole: req.user?.role,
          isPromotingSelf,
          adminCount,
          solution: "Enter your own email address to promote yourself"
        }
      });
    }

    const userToPromote = await User.findOne({ email });
    if (!userToPromote) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToPromote.role === "admin") {
      return res.status(400).json({ message: "User is already an admin" });
    }

    await User.updateOne({ email }, { role: "admin" });
    
    console.log("Successfully promoted user to admin");
    
    return res.json({ 
      message: `User ${email} has been promoted to admin`,
      isFirstAdmin: hasNoAdmins 
    });
  } catch (error) {
    console.error("Promotion error:", error);
    res.status(500).json({ message: "Promotion failed", details: error.message });
  }
};

export const debugUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const adminCount = await User.countDocuments({ role: "admin" });
    
    return res.json({
      message: "User debug info",
      currentUser: {
        id: currentUser._id,
        email: currentUser.email,
        role: currentUser.role,
        skills: currentUser.skills
      },
      systemInfo: {
        totalAdmins: adminCount,
        hasNoAdmins: adminCount === 0
      },
      tokenInfo: req.user
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ message: "Debug failed", details: error.message });
  }
};