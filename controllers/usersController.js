import Users from "../models/usersModel.js";
import messages from "../utils/messages.js";
import { handleServerError } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";

// Get all users
export const getUsers = async (req, res) => {
   try {
      const users = await Users.findAll({
         attributes: ["userId", "name", "username", "role", "createdAt"],
         order: [["createdAt", "DESC"]],
      });
      res.status(200).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: users,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Get user by ID
export const getUserById = async (req, res) => {
   try {
      const { userId } = req.params;
      const user = await Users.findByPk(userId, {
         attributes: ["userId", "name", "username", "role", "createdAt"],
      });

      if (!user) {
         return res.status(404).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      res.status(200).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: user,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};
// Get user by ID
export const getSession = async (req, res) => {
   res.status(200).json({
      loggedIn: true,
      user: req.user
   });
};

// Create a new user
export const createUser = async (req, res) => {
   try {
      const { name, username, password, role } = req.body;
      if (!name || !username || !password || !role) {
         return res.status(400).json({
            code: messages.HTTP_STATUS.BAD_REQUEST.code,
            message: messages.HTTP_STATUS.BAD_REQUEST.message,
         });
      }

      const existingUser = await Users.findOne({ where: { username } });
      if (existingUser) {
         return res.status(409).json({
            code: messages.HTTP_STATUS.CONFLICT.code,
            message: messages.HTTP_STATUS.CONFLICT.message,
         });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await Users.create({
         name,
         username,
         password: hashedPassword,
         role,
      });

      res.status(201).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.HTTP_STATUS.CREATED.message,
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

// Update user by ID
export const updateUser = async (req, res) => {
   try {
      const { userId } = req.params;
      const { name, username, password, role } = req.body;

      const user = await Users.findByPk(userId);
      if (!user) {
         return res.status(404).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      // Check for duplicate username (if changed)
      if (username && username !== user.username) {
         const duplicate = await Users.findOne({ where: { username } });
         if (duplicate) {
            return res.status(409).json({
               code: messages.HTTP_STATUS.CONFLICT.code,
               message: messages.HTTP_STATUS.CONFLICT.message,
            });
         }
      }

      if (password) {
         user.password = await bcrypt.hash(password, 10);
      }

      user.name = name || user.name;
      user.username = username || user.username;
      user.role = role || user.role;

      await user.save();

      res.status(200).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
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

// Delete user
export const deleteUser = async (req, res) => {
   try {
      const { userId } = req.params;

      const user = await Users.findByPk(userId);
      if (!user) {
         return res.status(404).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      await user.destroy();

      res.status(200).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};
