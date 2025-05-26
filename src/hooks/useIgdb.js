import { useEffect, useState } from "react";
import { igdbFetch } from "../services/igdbService";

export function useIgdb(endpoint, query) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await igdbFetch(endpoint, query);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, query]);

  return { data, loading, error };
}
