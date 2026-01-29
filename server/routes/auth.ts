import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface ErrorResponse {
  message: string;
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: User already exists or invalid input
 */
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    console.log("[Register] Request received:", { email: req.body.email, name: req.body.name });
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      console.log("[Register] Missing required fields");
      return res.status(400).json({
        message: "Email, password, and name are required",
      } as ErrorResponse);
    }

    // Check if user already exists
    console.log("[Register] Checking if user exists:", email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("[Register] User already exists:", email);
      return res
        .status(400)
        .json({ message: "User already exists" } as ErrorResponse);
    }

    // Create new user
    console.log("[Register] Creating new user:", email);
    const user = new User({ email, password, name });
    console.log("[Register] Saving user to database");
    await user.save();
    console.log("[Register] User saved successfully");

    // Generate JWT token
    console.log("[Register] Generating JWT token");
    const token = jwt.sign(
      { userId: user._id, email: user.email } as JWTPayload,
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("[Register] Sending response");
    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    } as AuthResponse);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" } as ErrorResponse);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid email or password
 */
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    console.log("[Login] Request received:", { email: req.body.email });
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log("[Login] Missing email or password");
      return res
        .status(400)
        .json({ message: "Email and password are required" } as ErrorResponse);
    }

    // Find user
    console.log("[Login] Finding user with email:", email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log("[Login] User not found:", email);
      return res
        .status(401)
        .json({ message: "Invalid email or password" } as ErrorResponse);
    }

    console.log("[Login] User found, comparing password");
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log("[Login] Password invalid for user:", email);
      return res
        .status(401)
        .json({ message: "Invalid email or password" } as ErrorResponse);
    }

    console.log("[Login] Password valid, generating token");
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email } as JWTPayload,
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("[Login] Token generated, sending response");
    res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    } as AuthResponse);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" } as ErrorResponse);
  }
};

/**
 * @swagger
 * /api/auth/update:
 *   put:
 *     summary: Update user profile
 *     description: Update authenticated user's profile information
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export const handleUpdateProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { name, password } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized" } as ErrorResponse);
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found" } as ErrorResponse);
    }

    // Update fields if provided
    if (name) {
      user.name = name;
    }

    if (password) {
      user.password = password; // Pre-save hook will hash it
    }

    // Save the updated user
    await user.save();

    res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    } as Omit<AuthResponse, "token">);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" } as ErrorResponse);
  }
};
