import { Router } from "express";
import { postVisualSearch, visualSearchUpload } from "../controllers/visualSearchController.js";
import { getCatalogSearch } from "../controllers/searchController.js";

const router = Router();

/** Text search — all marketplaces (Amazon, Noon, eBay, …) */
router.get("/", getCatalogSearch);
router.post("/visual", visualSearchUpload, postVisualSearch);

export default router;
