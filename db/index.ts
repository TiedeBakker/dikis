// import { drizzle } from "drizzle-orm/libsql";
// import { createClient } from "@libsql/client";
// import * as schema from "./schema";

// const client = createClient({
//   url: process.env.TURSO_CONNECTION_URL!,
//   authToken: process.env.TURSO_AUTH_TOKEN,
// });

// export const db = drizzle(client, { schema });
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
  
  // TOEVOEGEN: De ultieme Next.js cache-sloper voor Turso
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      cache: "no-store", // Dit dwingt Vercel om ELKE SQL-query live uit te voeren
    });
  },
});

export const db = drizzle(client, { schema });