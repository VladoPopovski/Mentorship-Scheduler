import { useQuery } from "@tanstack/react-query";
import { listSlots } from "../lib/api";

export function useSlots() {
  return useQuery({
    queryKey: ["slots"],
    queryFn: listSlots,
    refetchInterval: 10_000, // re-check every 10 s so booked slots turn grey for everyone
  });
}