import express, { Router } from "express";
import {
	create,
	getAll,
	update,
	remove,
	getReviewByProductId,
} from "../controllers/review.controller";
import { Authenticate } from "../middlewares/authentication.middleware";
import { onlyAdmin, onlyUser } from "../@types/global.types";

const router: Router = express.Router();

// create review
router.post("/", Authenticate(onlyUser), create);

// update review
router.put("/:id", Authenticate(onlyUser), update);

// get all reviews
router.get("/", Authenticate(onlyAdmin), getAll);

// get by product id
router.get("/:productId", getReviewByProductId);

// remove
router.delete("/:id", remove);

export default router;
