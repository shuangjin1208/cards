import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Decks
  app.get(api.decks.list.path, async (req, res) => {
    const decks = await storage.getDecks();
    res.json(decks);
  });

  app.get(api.decks.get.path, async (req, res) => {
    const deck = await storage.getDeck(Number(req.params.id));
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }
    res.json(deck);
  });

  app.post(api.decks.create.path, async (req, res) => {
    try {
      const input = api.decks.create.input.parse(req.body);
      const deck = await storage.createDeck(input);
      res.status(201).json(deck);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.decks.update.path, async (req, res) => {
    try {
      const input = api.decks.update.input.parse(req.body);
      const deck = await storage.updateDeck(Number(req.params.id), input);
      res.json(deck);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.decks.delete.path, async (req, res) => {
    await storage.deleteDeck(Number(req.params.id));
    res.status(204).end();
  });

  // Cards
  app.get(api.cards.list.path, async (req, res) => {
    const cards = await storage.getDeckCards(Number(req.params.deckId));
    res.json(cards);
  });

  app.post(api.cards.create.path, async (req, res) => {
    try {
      const input = api.cards.create.input.parse(req.body);
      const card = await storage.createCard({
        deckId: Number(req.params.deckId),
        front: input.front,
        back: input.back,
        status: 'new'
      });
      res.status(201).json(card);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.cards.update.path, async (req, res) => {
    try {
      const input = api.cards.update.input.parse(req.body);
      const card = await storage.updateCard(Number(req.params.id), input);
      res.json(card);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.cards.delete.path, async (req, res) => {
    await storage.deleteCard(Number(req.params.id));
    res.status(204).end();
  });

  app.post(api.cards.import.path, async (req, res) => {
    try {
      const input = api.cards.import.input.parse(req.body);
      const count = await storage.importCards(Number(req.params.deckId), input.text);
      res.status(201).json({ count });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Sessions
  app.get(api.sessions.get.path, async (req, res) => {
    const session = await storage.getSession(Number(req.params.deckId));
    res.json(session || null);
  });

  app.put(api.sessions.save.path, async (req, res) => {
    try {
      const input = api.sessions.save.input.parse(req.body);
      const session = await storage.saveSession(Number(req.params.deckId), input.state);
      res.json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.sessions.delete.path, async (req, res) => {
    await storage.deleteSession(Number(req.params.deckId));
    res.status(204).end();
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const decks = await storage.getDecks();
  if (decks.length === 0) {
    const deck = await storage.createDeck({ name: 'JavaScript 基础', description: '核心 JS 概念' });
    await storage.createCard({ deckId: deck.id, front: '什么是闭包 (Closure)？', back: '一个函数及其对周围状态（词法环境）的引用捆绑在一起的组合。', status: 'new' });
    await storage.createCard({ deckId: deck.id, front: '什么是变量提升 (Hoisting)？', back: '在执行代码前，将变量和函数的声明移动到其所在作用域顶部的过程。', status: 'new' });
    await storage.createCard({ deckId: deck.id, front: 'const vs let', back: 'const 是块级作用域且不能重新赋值，let 是块级作用域但可以重新赋值。', status: 'easy' });
    
    const deck2 = await storage.createDeck({ name: '英语生词', description: '日常用语' });
    await storage.createCard({ deckId: deck2.id, front: 'Awesome', back: '极好的，令人惊叹的', status: 'easy' });
    await storage.createCard({ deckId: deck2.id, front: 'Fascinating', back: '迷人的，吸引人的', status: 'new' });
  }
}