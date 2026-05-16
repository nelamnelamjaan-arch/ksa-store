import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Monorepo root `.env` first, then optional `server/.env` overrides.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
