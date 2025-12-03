import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Generation, normalizeGeneration } from "@/types/generation";

interface GenerationsResponse {
  data: Generation[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function useGenerations() {
  const { session } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [pagination, setPagination] = useState<GenerationsResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGenerations = useCallback(async (limit = 20, offset = 0) => {
    if (!session?.access_token) {
      setGenerations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("list-generations", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { limit, offset },
      });

      if (error) throw error;
      const normalized = (data.data || []).map(normalizeGeneration);
      setGenerations(normalized);
      setPagination(data.pagination);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching generations:", err);
      setError(err.message || "Failed to fetch generations");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  return { generations, pagination, loading, error, refetch: fetchGenerations };
}

export function useGeneration(id: string | null) {
  const { session } = useAuth();
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGeneration = useCallback(async () => {
    if (!session?.access_token || !id) {
      setGeneration(null);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke(`get-generation?id=${id}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      setGeneration(normalizeGeneration(data));
      setError(null);
    } catch (err: any) {
      console.error("Error fetching generation:", err);
      setError(err.message || "Failed to fetch generation");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, id]);

  useEffect(() => {
    fetchGeneration();
  }, [fetchGeneration]);

  return { generation, loading, error, refetch: fetchGeneration };
}

export type { Generation } from "@/types/generation";
