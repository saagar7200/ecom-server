import express from "express";
import { placeOrder } from "../controllers/order.controller";
import { Authenticate } from "../middlewares/authentication.middleware";
import { onlyUser } from "../@types/global.types";

const router = express.Router();

router.post("/", Authenticate(onlyUser), placeOrder);

export default router;
