import { sql } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

export const logboek = sqliteTable("logboek", {
  // De primary key genereren we direct als een unieke tekst (UUID)
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  
  // De invoerdatum, standaard ingesteld op het huidige tijdstip op de server
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  
  // Velden voor de daadwerkelijke data
  categorie: text("categorie").notNull(),
  titel: text("titel").notNull(),
  inhoud: text("inhoud").notNull(),
  
  // Optioneel: metadata zoals welk apparaat of interpretatie (voor later)
  interpretatie: text("interpretatie"),
});