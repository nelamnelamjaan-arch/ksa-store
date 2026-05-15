import { Router } from "express";
import { postVisualSearch, visualSearchUpload } from "../controllers/visualSearchController.js";

const router = Router();

router.post("/visual", visualSearchUpload, postVisualSearch);

export default router;
