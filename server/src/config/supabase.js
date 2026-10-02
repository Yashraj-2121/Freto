import { createAdminClient, createContextClient } from "@supabase/serv..er/core";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Use this for background jobs, webhooks, or tasks that require bypassing RLS.
export const supabaseAdmin = createAdminClient();

// Use this if you need a public client (no user JWT) for non-authenticated endpoints
export const supabasePublic = createContextClient();
