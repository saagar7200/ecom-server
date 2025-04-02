import express from "express";
import { Authenticate } from "../middlewares/authentication.middleware";
import { onlyUser } from "../@types/global.types";
import {
	create,
	clearWishlist,
	getUserWishlist,
	removeProductFromList,
} from "../controllers/wishlist.controller";

const router = express.Router();

// add to wishlist
router.post("/", Authenticate(onlyUser), create);

// clear list
router.delete("/", Authenticate(onlyUser), clearWishlist);

// get users wishlist
router.get("/", Authenticate(onlyUser), getUserWishlist);

// remove product from list
router.delete(
	"/remove/:productId",
	Authenticate(onlyUser),
	removeProductFromList
);

export default router;
