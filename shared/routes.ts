import { z } from 'zod';
import { insertDeckSchema, insertCardSchema, decks, cards, studySessions } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  decks: {
    list: {
      method: 'GET' as const,
      path: '/api/decks' as const,
      responses: {
        200: z.array(z.custom<typeof decks.$inferSelect & { cardCount: number, masteredCount: number }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/decks/:id' as const,
      responses: {
        200: z.custom<typeof decks.$inferSelect & { cardCount: number, masteredCount: number }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/decks' as const,
      input: insertDeckSchema,
      responses: {
        201: z.custom<typeof decks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/decks/:id' as const,
      input: insertDeckSchema.partial(),
      responses: {
        200: z.custom<typeof decks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/decks/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  cards: {
    list: {
      method: 'GET' as const,
      path: '/api/decks/:deckId/cards' as const,
      responses: {
        200: z.array(z.custom<typeof cards.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/decks/:deckId/cards' as const,
      input: z.object({ front: z.string(), back: z.string() }),
      responses: {
        201: z.custom<typeof cards.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/cards/:id' as const,
      input: z.object({ front: z.string().optional(), back: z.string().optional(), status: z.string().optional() }),
      responses: {
        200: z.custom<typeof cards.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cards/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    import: {
      method: 'POST' as const,
      path: '/api/decks/:deckId/cards/import' as const,
      input: z.object({ text: z.string() }),
      responses: {
        201: z.object({ count: z.number() }),
        400: errorSchemas.validation,
      },
    },
  },
  sessions: {
    get: {
      method: 'GET' as const,
      path: '/api/decks/:deckId/session' as const,
      responses: {
        200: z.custom<typeof studySessions.$inferSelect>().nullable(),
      },
    },
    save: {
      method: 'PUT' as const,
      path: '/api/decks/:deckId/session' as const,
      input: z.object({ state: z.any() }),
      responses: {
        200: z.custom<typeof studySessions.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/decks/:deckId/session' as const,
      responses: {
        204: z.void(),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}