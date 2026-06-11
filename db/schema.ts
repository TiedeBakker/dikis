import { sql } from "drizzle-orm";
import { text, sqliteTable, real } from "drizzle-orm/sqlite-core";

// ==========================================
// 1. MOEDERTABELLEN (Beheer primair via PC)
// ==========================================

export const personen = sqliteTable("personen", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  voornamen: text("voornamen").notNull(),
  tussenvoegsel: text("tussenvoegsel"),
  achternaam: text("achternaam").notNull(),
  // Datumvelden opslaan als ISO tekst strings (YYYY-MM-DD) in SQLite
  geboortedatum: text("geboortedatum"), 
  datumOverlijden: text("datum_overlijden"),
});

export const gebouwen = sqliteTable("gebouwen", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  straat: text("straat").notNull(),
  nummer: text("nummer").notNull(), // Tekst, i.v.m. toevoegingen zoals '12-A'
  plaats: text("plaats").notNull(),
  korteAanduiding: text("korte_aanduiding"),
  postcode: text("postcode"),
  // Real is perfect voor coördinaten/decimalen
  xCoordinaat: real("x_coordinaat"), 
  yCoordinaat: real("y_coordinaat"),
});

export const parameters = sqliteTable("parameters", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  naam: text("naam").notNull(),
  eenheidId: text("eenheid_id"), // Optionele link naar toekomstige eenheden-tabel
  toelichting: text("toelichting"),
});

export const aspecttypen = sqliteTable("aspecttypen", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  aanduiding: text("aanduiding").notNull(),
  toelichting: text("toelichting"),
});

// ==========================================
// 2. INVOER TABELLEN (App & PC)
// ==========================================

export const metingen = sqliteTable("metingen", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  objectId: text("object_id").notNull(), // Alleen nog de pure UUID!
  parameterId: text("parameter_id").notNull(),
  waarde: real("waarde").notNull(),
  datumTijd: text("datum_tijd").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const aspecten = sqliteTable("aspecten", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  objectId: text("object_id").notNull(), // Alleen nog de pure UUID!
  aspecttypeId: text("aspecttype_id").notNull(),
  waarde: text("waarde").notNull(),
  datumTijd: text("datum_tijd").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

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