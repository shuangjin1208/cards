import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const decks = pgTable("decks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastStudiedAt: timestamp("last_studied_at"),
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  status: text("status").default('new').notNull(), // 'new', 'easy', 'good', 'again'
  lastReviewedAt: timestamp("last_reviewed_at"),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").notNull().unique(),
  state: jsonb("state").notNull(), 
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDeckSchema = createInsertSchema(decks).omit({ id: true, createdAt: true, lastStudiedAt: true });
export const insertCardSchema = createInsertSchema(cards).omit({ id: true, lastReviewedAt: true });
export const insertSessionSchema = createInsertSchema(studySessions).omit({ id: true, updatedAt: true });

export type Deck = typeof decks.$inferSelect;
export type InsertDeck = z.infer<typeof insertDeckSchema>;
export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertSessionSchema>;

export type DeckWithStats = Deck & { cardCount: number, masteredCount: number };