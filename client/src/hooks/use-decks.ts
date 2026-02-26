import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertDeck } from "@shared/schema";

export function useDecks() {
  return useQuery({
    queryKey: [api.decks.list.path],
    queryFn: async () => {
      const res = await fetch(api.decks.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch decks");
      return api.decks.list.responses[200].parse(await res.json());
    },
  });
}

export function useDeck(id: number) {
  return useQuery({
    queryKey: [api.decks.get.path, id],
    queryFn: async () => {
      if (!id || isNaN(id)) return null;
      const url = buildUrl(api.decks.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch deck");
      return api.decks.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDeck) => {
      const validated = api.decks.create.input.parse(data);
      const res = await fetch(api.decks.create.path, {
        method: api.decks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create deck");
      return api.decks.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.decks.list.path] }),
  });
}

export function useUpdateDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertDeck>) => {
      const validated = api.decks.update.input.parse(updates);
      const url = buildUrl(api.decks.update.path, { id });
      const res = await fetch(url, {
        method: api.decks.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update deck");
      return api.decks.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.decks.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.decks.get.path, id] });
    },
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.decks.delete.path, { id });
      const res = await fetch(url, { method: api.decks.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete deck");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.decks.list.path] }),
  });
}
