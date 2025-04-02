"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrderStatus = exports.getByUserId = exports.getAllOrder = exports.placeOrder = void 0;
const asyncHandler_util_1 = require("../utils/asyncHandler.util");
const cart_model_1 = require("../models/cart.model");
const errorhandler_middleare_1 = __importDefault(require("../middlewares/errorhandler.middleare"));
const product_model_1 = __importDefault(require("../models/product.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const orderconfirmationEmail_util_1 = require("../utils/orderconfirmationEmail.util");
const pagination_utils_1 = require("../utils/pagination.utils");
exports.placeOrder = (0, asyncHandler_util_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const cart = yield cart_model_1.Cart.findOne({ user: userId });
    if (!cart) {
        throw new errorhandler_middleare_1.default("Cart not found", 404);
    }
    const products = (yield Promise.all(cart.items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        const product = yield product_model_1.default.findById(item.product);
        if (!product)
            return null;
        return {
            product: product._id,
            quantity: item.quantity,
            totalPrice: Number(product.price) * item.quantity,
        };
    })))).filter((item) => item !== null);
    const totalAmount = products.reduce((acc, item) => acc + item.totalPrice, 0);
    const order = new order_model_1.default({
        user: userId,
        items: products,
        totalAmount,
    });
    const newOrder = yield order.save();
    const populatedOrder = yield order_model_1.default.findById(newOrder._id).populate("items.product");
    if (!populatedOrder) {
        throw new errorhandler_middleare_1.default("Order not created", 404);
    }
    yield (0, orderconfirmationEmail_util_1.sendOrderConfirmationEmail)({
        to: req.user.email,
        orderDetails: {
            items: populatedOrder.items,
            orderId: populatedOrder.orderId,
            totalAmount: populatedOrder.totalAmount,
            createdAt: populatedOrder.createdAt,
        },
    });
    // await Cart.findByIdAndDelete(cart._id);
    res.status(201).json({
        success: true,
        status: "success",
        message: "Oder placed successfully",
        data: newOrder,
    });
}));
exports.getAllOrder = (0, asyncHandler_util_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, status, query, minTotal, maxTotal, toDate, fromDate } = req.query;
    let filter = {};
    const currentPage = parseInt(page) || 1;
    const perPage = parseInt(limit) || 10;
    const skip = (currentPage - 1) * perPage;
    if (query) {
        filter.orderId = { $regex: query, $options: "i" };
    }
    if (status) {
        filter.status = status;
    }
    if (minTotal || maxTotal) {
        if (minTotal && maxTotal) {
            filter.totalAmount = {
                $lte: parseFloat(maxTotal),
                $gte: parseFloat(minTotal),
            };
        }
        if (minTotal) {
            filter.totalAmount = { $gte: parseFloat(minTotal) };
        }
        if (maxTotal) {
            filter.totalAmount = { $lte: parseFloat(maxTotal) };
        }
    }
    // date filter
    if (toDate || fromDate) {
        if (toDate && fromDate) {
            filter.createdAt = {
                $lte: new Date(toDate),
                $gte: new Date(fromDate),
            };
        }
        if (fromDate) {
            filter.createdAt = { $gte: new Date(fromDate) };
        }
        if (toDate) {
            filter.createdAt = { $lte: new Date(toDate) };
        }
    }
    const allOrders = yield order_model_1.default.find(filter)
        .skip(skip)
        .limit(perPage)
        .populate("items.product")
        .populate("user", "-password")
        .sort({ createdAt: -1 });
    const totalCount = yield order_model_1.default.countDocuments(filter);
    res.status(201).json({
        success: true,
        status: "success",
        message: "Oder fetched successfully",
        data: {
            data: allOrders,
            pagination: (0, pagination_utils_1.getPaginationData)(currentPage, perPage, totalCount),
        },
    });
}));
exports.getByUserId = (0, asyncHandler_util_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const orders = order_model_1.default.findOne({ user: userId })
        .populate("items.product")
        .populate("user", "-password");
    res.status(200).json({
        success: true,
        status: "success",
        message: "Oder fetched successfully",
        data: orders,
    });
}));
exports.updateOrderStatus = (0, asyncHandler_util_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!status) {
        throw new errorhandler_middleare_1.default("Status is required", 400);
    }
    if (!orderId) {
        throw new errorhandler_middleare_1.default("orderId is required", 400);
    }
    const updatedOrder = yield order_model_1.default.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!updatedOrder) {
        throw new errorhandler_middleare_1.default("order not found", 404);
    }
    res.status(200).json({
        success: true,
        status: "success",
        message: "Oder status updated successfully",
        data: updatedOrder,
    });
}));
exports.deleteOrder = (0, asyncHandler_util_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    if (!orderId) {
        throw new errorhandler_middleare_1.default("orderId is required", 400);
    }
    const deletedOrder = yield order_model_1.default.findByIdAndDelete(orderId);
    if (!deletedOrder) {
        throw new errorhandler_middleare_1.default("order not found", 404);
    }
    res.status(200).json({
        success: true,
        status: "success",
        message: "Oder deleted successfully",
        data: deletedOrder,
    });
}));
// cancel own order
