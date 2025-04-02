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
exports.clearWishlist = exports.getUserWishlist = exports.removeProductFromList = exports.create = void 0;
const asyncHandler_util_1 = require("../utils/asyncHandler.util");
const user_model_1 = __importDefault(require("../models/user.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const errorhandler_middleare_1 = __importDefault(require("../middlewares/errorhandler.middleare"));
exports.create = (0, asyncHandler_util_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const { productId } = req.body;
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new errorhandler_middleare_1.default("User not found", 404);
    }
    const product = yield product_model_1.default.findById(productId);
    if (!product) {
        throw new errorhandler_middleare_1.default("Product not found", 404);
    }
    const existingProduct = user.wishList.find((list) => list.toString() === productId);
    if (!existingProduct) {
        user.wishList.push(productId);
    }
    yield user.save();
    res.status(201).json({
        status: "success",
        success: true,
        data: user.wishList,
        message: "product added to wishlist successfully",
    });
}));
exports.removeProductFromList = (0, asyncHandler_util_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const productId = req.params.productId;
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new errorhandler_middleare_1.default("User not found", 404);
    }
    const existingProduct = user.wishList.find((list) => list.toString() === productId);
    if (!existingProduct) {
        throw new errorhandler_middleare_1.default("Product does not exists in list", 404);
    }
    user.wishList.filter((list) => list.toString() !== productId);
    yield user.save();
    res.status(200).json({
        status: "success",
        success: true,
        data: user.wishList,
        message: "product removed from wishlist successfully",
    });
}));
exports.getUserWishlist = (0, asyncHandler_util_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const user = yield user_model_1.default.findById(userId).populate("wishList");
    if (!user) {
        throw new errorhandler_middleare_1.default("User not found", 404);
    }
    res.status(200).json({
        status: "success",
        success: true,
        data: user.wishList,
        message: "Wishlist fetched successfully",
    });
}));
exports.clearWishlist = (0, asyncHandler_util_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const user = yield user_model_1.default.findById(userId).populate("wishList");
    if (!user) {
        throw new errorhandler_middleare_1.default("User not found", 404);
    }
    user.wishList = [];
    yield user.save();
    res.status(200).json({
        status: "success",
        success: true,
        data: user.wishList,
        message: "Wishlist cleared successfully",
    });
}));
