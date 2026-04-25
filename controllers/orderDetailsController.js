import OrderDetail from "../models/orderDetailsModel.js";
import Menu from "../models/menusModel.js";

import messages from "../utils/messages.js";
import { handleServerError } from "../utils/errorHandler.js";
import { validateRequiredField } from "../utils/validation.js";
import Order from "../models/ordersModel.js";

// Get all order details
export const getOrderDetails = async (req, res) => {
   try {
      const orderDetails = await OrderDetail.findAll({
         include: [
            { model: Order },
            { model: Menu, attributes: ["menuId", "menuName", "price"] },
         ],
         order: [["orderDetailId", "DESC"]],
      });

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: orderDetails,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Get order detail by ID
export const getOrderDetailById = async (req, res) => {
   try {
      const { orderDetailId } = req.params;
      const detail = await OrderDetail.findByPk(orderDetailId, {
         include: [{ model: Menu, attributes: ["menuId", "menuName", "price"] }],
      });

      if (!detail) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: detail,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Create new order detail
export const createOrderDetail = async (req, res) => {
   try {
      const { orderId, menuId, quantity, price, notes } = req.body;
      console.log(req.body)

      // Validate required fields
      const orderIdError = validateRequiredField(orderId, "Order ID");
      const menuIdError = validateRequiredField(menuId, "Menu ID");
      const quantityError = validateRequiredField(quantity, "Quantity");
      const priceError = validateRequiredField(price, "Price");

      if (orderIdError || menuIdError || quantityError || priceError) {
         return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
            code: messages.HTTP_STATUS.BAD_REQUEST.code,
            message: orderIdError || menuIdError || quantityError || priceError,
         });
      }

      const subtotal = price * quantity;

      const detail = await OrderDetail.create({
         orderId,
         menuId,
         quantity,
         price,
         subtotal,
         notes,
      });

      res.status(messages.HTTP_STATUS.CREATED.code).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace(
            "%{name}",
            "Order detail"
         ),
         data: detail,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Update order detail
export const updateOrderDetail = async (req, res) => {
   try {
      const { orderDetailId } = req.params;
      const { quantity, price, notes } = req.body;

      const detail = await OrderDetail.findByPk(orderDetailId);
      if (!detail) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      // If either quantity or price is updated, subtotal should be recalculated
      const newQuantity = quantity ?? detail.quantity;
      const newPrice = price ?? detail.price;
      const newNotes = notes ?? detail.notes;

      detail.quantity = newQuantity;
      detail.price = newPrice;
      detail.subtotal = newQuantity * newPrice;
      detail.notes = newNotes;

      await detail.save();

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace(
            "%{name}",
            "Order detail"
         ),
         data: detail,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Delete order detail
export const deleteOrderDetail = async (req, res) => {
   try {
      const { orderDetailId } = req.params;

      const detail = await OrderDetail.findByPk(orderDetailId);
      if (!detail) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      await detail.destroy();

      res.status(messages.HTTP_STATUS.OK.code).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace(
            "%{name}",
            "Order detail"
         ),
         data: detail,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Delete all order details by orderId
export const deleteOrderDetailsByOrderId = async (req, res) => {
   try {
      const { orderId } = req.params;

      // Find all details for the order
      const details = await OrderDetail.findAll({ where: { orderId } });

      if (!details.length) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      // Bulk delete
      await OrderDetail.destroy({ where: { orderId } });

      return res.status(messages.HTTP_STATUS.OK.code).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace(
            "%{name}",
            "Order details"
         ),
      });
   } catch (error) {
      handleServerError(error, res);
   }
};
