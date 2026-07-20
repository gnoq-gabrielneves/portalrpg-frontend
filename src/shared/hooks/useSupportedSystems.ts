import { useQuery } from "@tanstack/react-query";
import { getSupportedSystems } from "../services/getSupportedSystems";

export function useSupportedSystems() {
  return useQuery({
    queryKey: ["supported-systems"],
    queryFn: getSupportedSystems,
  });
}
