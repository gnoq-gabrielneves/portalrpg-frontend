"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrdemOriginPowers } from "../services/ordemRulesService";

export function useOrdemOriginPowers() {
  return useQuery({
    queryFn: getOrdemOriginPowers,
    queryKey: ["ordem-rules", "origin-powers"],
  });
}
