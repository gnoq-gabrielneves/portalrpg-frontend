"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrdemClassTracks } from "../services/ordemRulesService";
import { OrdemAgentClass } from "../types/campaign";

export function useOrdemClassTracks(agentClass: OrdemAgentClass, nex: number) {
  return useQuery({
    enabled: Boolean(agentClass),
    queryFn: () => getOrdemClassTracks(agentClass, nex),
    queryKey: ["ordem-rules", "class-tracks", agentClass, nex],
  });
}
