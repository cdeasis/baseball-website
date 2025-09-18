import { useEffect, useState } from "react";
import { loadStandingsOnce } from "../util/standingsCache";

export function useStandingsMap() {
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const { teams } = await loadStandingsOnce();
        if (dead) return;
        const m = new Map();
        for (const t of teams) m.set(t.abbreviation, t);
        setMap(m);
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => { dead = true; };
  }, []);

  return { map, loading };
}