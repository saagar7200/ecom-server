import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import User from "../models/user.model";
import Product from "../models/product.model";
import CustomError from "../middlewares/errorhandler.middleare";

export const create = asyncHandler(async (req: Request, res: Response) => {
	const userId = req.user._id;
	const { productId } = req.body;

	const user = await User.findById(userId);

	if (!user) {
		throw new CustomError("User not found", 404);
	}

	const product = await Product.findById(productId);
	if (!product) {
		throw new CustomError("Product not found", 404);
	}

	const existingProduct = user.wishList.find(
		(list) => list.toString() === productId
	);

	if (!existingProduct) {
		user.wishList.push(productId);
	}

	await user.save();

	res.status(201).json({
		status: "success",
		success: true,
		data: user.wishList,
		message: "product added to wishlist successfully",
	});
});

export const removeProductFromList = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user._id;
		const productId = req.params.productId;

		const user = await User.findById(userId);

		if (!user) {
			throw new CustomError("User not found", 404);
		}

		const existingProduct = user.wishList.find(
			(list) => list.toString() === productId
		);

		if (!existingProduct) {
			throw new CustomError("Product does not exists in list", 404);
		}

		user.wishList.filter((list) => list.toString() !== productId);

		await user.save();

		res.status(200).json({
			status: "success",
			success: true,
			data: user.wishList,
			message: "product removed from wishlist successfully",
		});
	}
);

export const getUserWishlist = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user._id;

		const user = await User.findById(userId).populate("wishList");

		if (!user) {
			throw new CustomError("User not found", 404);
		}

		res.status(200).json({
			status: "success",
			success: true,
			data: user.wishList,
			message: "Wishlist fetched successfully",
		});
	}
);

export const clearWishlist = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user._id;

		const user = await User.findById(userId).populate("wishList");

		if (!user) {
			throw new CustomError("User not found", 404);
		}

		user.wishList = [];

		await user.save();

		res.status(200).json({
			status: "success",
			success: true,
			data: user.wishList,
			message: "Wishlist cleared successfully",
		});
	}
);
