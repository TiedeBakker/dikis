import { config } from "dotenv";
config({ path: ".env.local" }); // Dwing dotenv om .env.local te lezen
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    // We voegen een '|| ""' toe zodat TypeScript weet dat het altijd een string is
    url: process.env.TURSO_CONNECTION_URL || "", 
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});