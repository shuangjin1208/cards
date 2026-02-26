import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useCards(deckId: number) {
  return useQuery({
    queryKey: [api.cards.list.path, deckId],
    queryFn: async () => {
      if (!deckId || isNaN(deckId)) return [];
      const url = buildUrl(api.cards.list.path, { deckId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cards");
      return api.cards.list.responses[200].parse(await res.json());
    },
    enabled: !!deckId,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ deckId, front, back }: { deckId: number; front: string; back: string }) => {
      const validated = api.cards.create.input.parse({ front, back });
      const url = buildUrl(api.cards.create.path, { deckId });
      const res = await fetch(url, {
        method: api.cards.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create card");
      return api.cards.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: [api.cards.list.path, deckId] });
      queryClient.invalidateQueries({ queryKey: [api.decks.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.decks.get.path, deckId] });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, deckId, ...updates }: { id: number; deckId: number; front?: string; back?: string; status?: string }) => {
      const validated = api.cards.update.input.parse(updates);
      const url = buildUrl(api.cards.update.path, { id });
      const res = await fetch(url, {
        method: api.cards.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update card");
      return api.cards.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: [api.cards.list.path, deckId] });
      queryClient.invalidateQueries({ queryKey: [api.decks.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.decks.get.path, deckId] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, deckId }: { id: number; deckId: number }) => {
      const url = buildUrl(api.cards.delete.path, { id });
      const res = await fetch(url, { method: api.cards.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete card");
    },
    onSuccess: (_, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: [api.cards.list.path, deckId] });
      queryClient.invalidateQueries({ queryKey: [api.decks.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.decks.get.path, deckId] });
    },
  });
}

export function useImportCards() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ deckId, text }: { deckId: number; text: string }) => {
      const validated = api.cards.import.input.parse({ text });
      const url = buildUrl(api.cards.import.path, { deckId });
      const res = await fetch(url, {
        method: api.cards.import.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to import cards");
      return api.cards.import.responses[201].parse(await res.json());
    },
    onSuccess: (_, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: [api.cards.list.path, deckId] });
      queryClient.invalidateQueries({ queryKey: [api.decks.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.decks.get.path, deckId] });
    },
  });
}
