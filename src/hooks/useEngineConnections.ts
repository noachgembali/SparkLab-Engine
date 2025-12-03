import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type EngineConnectionStatus = "connected" | "not_connected";

export interface EngineConnectionMap {
  [engineKey: string]: EngineConnectionStatus;
}

export function useEngineConnections() {
  const { session } = useAuth();
  const [connections, setConnections] = useState<EngineConnectionMap>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchConnections = useCallback(async () => {
    if (!session?.access_token) {
      setConnections({});
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("engine-connections", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const map: EngineConnectionMap = {};
      if (data?.connections) {
        data.connections.forEach((conn: { engine_key: string; status: string }) => {
          map[conn.engine_key] = conn.status === "connected" ? "connected" : "not_connected";
        });
      }
      setConnections(map);
    } catch (err) {
      console.error("Error fetching engine connections:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    connections,
    isLoading,
    refresh: fetchConnections,
  };
}
