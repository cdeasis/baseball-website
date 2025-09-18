import { useMemo } from "react";
import { useStandingsMap } from "./useStandingsMap";

export function useTeamRecord(teamAbbr) {
  const { map, loading } = useStandingsMap();

  const record = useMemo(() => {
    if (loading || !map) return "–";
    const t = map.get(teamAbbr);
    return t ? `${t.W}-${t.L}` : "–";
  }, [map, loading, teamAbbr]);

  return { record, loading };
}