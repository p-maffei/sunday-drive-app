import { Router, type IRouter } from "express";
import geocodingRouter from "./geocoding";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(geocodingRouter);

export default router;
