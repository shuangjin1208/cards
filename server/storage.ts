import { db } from "./db";
import { decks, cards, studySessions, type InsertDeck, type InsertCard, type InsertStudySession, type DeckWithStats } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Decks
  getDecks(): Promise<DeckWithStats[]>;
  getDeck(id: number): Promise<DeckWithStats | undefined>;
  createDeck(deck: InsertDeck): Promise<DeckWithStats>;
  updateDeck(id: number, updates: Partial<InsertDeck>): Promise<DeckWithStats>;
  deleteDeck(id: number): Promise<void>;
  
  // Cards
  getDeckCards(deckId: number): Promise<typeof cards.$inferSelect[]>;
  createCard(card: InsertCard): Promise<typeof cards.$inferSelect>;
  updateCard(id: number, updates: Partial<InsertCard>): Promise<typeof cards.$inferSelect>;
  deleteCard(id: number): Promise<void>;
  importCards(deckId: number, rawText: string): Promise<number>;
  
  // Sessions
  getSession(deckId: number): Promise<typeof studySessions.$inferSelect | undefined>;
  saveSession(deckId: number, state: any): Promise<typeof studySessions.$inferSelect>;
  deleteSession(deckId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getDecks(): Promise<DeckWithStats[]> {
    const allDecks = await db.select().from(decks);
    const stats = await Promise.all(
      allDecks.map(async (deck) => {
        const deckCards = await this.getDeckCards(deck.id);
        const mastered = deckCards.filter(c => c.status === 'easy').length;
        return { ...deck, cardCount: deckCards.length, masteredCount: mastered };
      })
    );
    return stats;
  }

  async getDeck(id: number): Promise<DeckWithStats | undefined> {
    const [deck] = await db.select().from(decks).where(eq(decks.id, id));
    if (!deck) return undefined;
    const deckCards = await this.getDeckCards(deck.id);
    const mastered = deckCards.filter(c => c.status === 'easy').length;
    return { ...deck, cardCount: deckCards.length, masteredCount: mastered };
  }

  async createDeck(insertDeck: InsertDeck): Promise<DeckWithStats> {
    const [deck] = await db.insert(decks).values(insertDeck).returning();
    return { ...deck, cardCount: 0, masteredCount: 0 };
  }

  async updateDeck(id: number, updates: Partial<InsertDeck>): Promise<DeckWithStats> {
    const [deck] = await db.update(decks).set(updates).where(eq(decks.id, id)).returning();
    const deckCards = await this.getDeckCards(deck.id);
    const mastered = deckCards.filter(c => c.status === 'easy').length;
    return { ...deck, cardCount: deckCards.length, masteredCount: mastered };
  }

  async deleteDeck(id: number): Promise<void> {
    await db.delete(studySessions).where(eq(studySessions.deckId, id));
    await db.delete(cards).where(eq(cards.deckId, id));
    await db.delete(decks).where(eq(decks.id, id));
  }

  async getDeckCards(deckId: number): Promise<typeof cards.$inferSelect[]> {
    return await db.select().from(cards).where(eq(cards.deckId, deckId));
  }

  async createCard(card: InsertCard): Promise<typeof cards.$inferSelect> {
    const [created] = await db.insert(cards).values(card).returning();
    return created;
  }

  async updateCard(id: number, updates: Partial<InsertCard>): Promise<typeof cards.$inferSelect> {
    const [updated] = await db.update(cards).set(updates).where(eq(cards.id, id)).returning();
    return updated;
  }

  async deleteCard(id: number): Promise<void> {
    await db.delete(cards).where(eq(cards.id, id));
  }

  async importCards(deckId: number, rawText: string): Promise<number> {
    const lines = rawText.split('\n');
    const newCards: InsertCard[] = [];
    
    for (const line of lines) {
      let parts = line.split('|').map(s => s.trim());
      if (parts.length < 2) parts = line.split('\t').map(s => s.trim());
      if (parts.length < 2) parts = line.split(',').map(s => s.trim());
      
      if (parts.length >= 2 && parts[0] && parts[1]) {
        newCards.push({
          deckId,
          front: parts[0],
          back: parts[1],
          status: 'new'
        });
      }
    }

    if (newCards.length > 0) {
      await db.insert(cards).values(newCards);
    }
    
    return newCards.length;
  }

  async getSession(deckId: number): Promise<typeof studySessions.$inferSelect | undefined> {
    const [session] = await db.select().from(studySessions).where(eq(studySessions.deckId, deckId));
    return session;
  }

  async saveSession(deckId: number, state: any): Promise<typeof studySessions.$inferSelect> {
    const existing = await this.getSession(deckId);
    if (existing) {
      const [updated] = await db.update(studySessions)
        .set({ state, updatedAt: new Date() })
        .where(eq(studySessions.deckId, deckId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(studySessions)
        .values({ deckId, state })
        .returning();
      return created;
    }
  }

  async deleteSession(deckId: number): Promise<void> {
    await db.delete(studySessions).where(eq(studySessions.deckId, deckId));
  }
}

export const storage = new DatabaseStorage();