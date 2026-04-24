import Users from "../models/usersModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { handleServerError } from "../utils/errorHandler.js";
import dotenv from "dotenv";
import cookie from "cookie";
dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const isProduction = process.env.NODE_ENV === "production";


// Helper to generate access token
const generateAccessToken = (payload) => {
   return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "7d" });
};

// Helper to generate refresh token
const generateRefreshToken = (payload) => {
   return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "30d" });
};

// Register new user
export const registerUser = async (req, res) => {
   try {
      const { name, username, password, role } = req.body;

      if (!name || !username || !password || !role) {
         return res.status(400).json({
            code: 400,
            message: "All fields are required",
         });
      }

      const existingUser = await Users.findOne({ where: { username } });
      if (existingUser) {
         return res.status(409).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await Users.create({
         name,
         username,
         password: hashedPassword,
         role,
      });

      res.status(201).json({
         code: 201,
         message: "User registered successfully",
         data: {
            userId: user.userId,
            name: user.name,
            username: user.username,
            role: user.role,
         },
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Login user
export const loginUser = async (req, res) => {
   try {
      const { username, password } = req.body;

      // Find the user in the database
      const user = await Users.findOne({ where: { username } });

      if (!user || !(await bcrypt.compare(password, user.password))) {
         return res
            .status(401)
            .json({ message: "Invalid username or password" });
      }

      const payload = { userId: user.userId, role: user.role };

      // Generate access and refresh tokens
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Save refreshToken to DB
      user.refreshToken = refreshToken;
      await user.save();

      // Set the access and refresh tokens in HTTP-only cookies
      res.setHeader("Set-Cookie", [
         cookie.serialize("accessToken", accessToken, {
            httpOnly: true,
            secure: isProduction,
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            sameSite: isProduction ? "none" : "lax",
            domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
         }),
         cookie.serialize("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
            sameSite: isProduction ? "none" : "lax",
            domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
         }),
      ]);

      // Respond with user details (but don't send tokens)
      res.status(200).json({
         message: "Login successful",
         data: {
            userId: user.userId,
            name: user.name,
            role: user.role,
         },
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Logout user
export const logoutUser = async (req, res) => {
   try {
      const { userId } = req.user;

      const user = await Users.findByPk(userId);
      if (user) {
         user.refreshToken = null;
         await user.save();
      }

      // Clear cookies by setting them to expire immediately
      res.setHeader("Set-Cookie", [
         cookie.serialize("accessToken", "", {
            httpOnly: true,
            secure: isProduction,
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            sameSite: isProduction ? "none" : "lax",
            domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
         }),
         cookie.serialize("refreshToken", "", {
            httpOnly: true,
            secure: isProduction,
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
            sameSite: isProduction ? "none" : "lax",
            domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
         }),
      ]);

      // Respond with a success message
      res.status(200).json({ message: "Logout successful" });
   } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({
         message: "Error during logout",
         error: error.message,
      });
   }
};

// Refresh token
export const refreshToken = async (req, res) => {
   const refreshToken = req.cookies.refreshToken;

   if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
   }

   try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const user = await Users.findByPk(decoded.userId);

      if (!user || user.refreshToken !== refreshToken) {
         // Clear cookies by setting them to expire immediately
         res.setHeader("Set-Cookie", [
            cookie.serialize("accessToken", "", {
               httpOnly: true,
               secure: isProduction,
               maxAge: 60 * 60 * 24 * 7,
               path: "/",
               sameSite: isProduction ? "none" : "lax",
               domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,

            }),
            cookie.serialize("refreshToken", "", {
               httpOnly: true,
               secure: process.env.NODE_ENV === "production",
               maxAge: 60 * 60 * 24 * 30,
               path: "/",
               sameSite: "lax"

            }),
         ]);
         return res.status(403).json({ message: "Invalid refresh token" });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
         userId: user.userId,
         role: user.role,
      });

      // Set new access token in cookies if needed
      res.setHeader(
         "Set-Cookie",
         cookie.serialize("accessToken", newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            sameSite: isProduction ? "none" : "lax",
            domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
         })
      );

      return res.status(200).json({
         message: "Access token refreshed",
         accessToken: newAccessToken,
      });
   } catch (error) {
      // Log the error for debugging
      console.error("Error refreshing token:", error);
      return res
         .status(403)
         .json({ message: "Invalid or expired refresh token" });
   }
};
