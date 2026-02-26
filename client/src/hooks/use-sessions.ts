import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useSession(deckId: number) {
  return useQuery({
    queryKey: [api.sessions.get.path, deckId],
    queryFn: async () => {
      if (!deckId || isNaN(deckId)) return null;
      const url = buildUrl(api.sessions.get.path, { deckId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch session");
      return api.sessions.get.responses[200].parse(await res.json());
    },
    enabled: !!deckId,
  });
}

export function useSaveSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ deckId, state }: { deckId: number; state: any }) => {
      const validated = api.sessions.save.input.parse({ state });
      const url = buildUrl(api.sessions.save.path, { deckId });
      const res = await fetch(url, {
        method: api.sessions.save.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save session");
      return api.sessions.save.responses[200].parse(await res.json());
    },
    onSuccess: (_, { deckId }) => {
      queryClient.invalidateQueries({ queryKey: [api.sessions.get.path, deckId] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deckId: number) => {
      const url = buildUrl(api.sessions.delete.path, { deckId });
      const res = await fetch(url, { method: api.sessions.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete session");
    },
    onSuccess: (_, deckId) => {
      queryClient.invalidateQueries({ queryKey: [api.sessions.get.path, deckId] });
    },
  });
}
