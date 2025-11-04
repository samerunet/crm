import { useCallback, useEffect, useRef, useState } from "react";

type Options<T> = {
  refreshInterval?: number;
  enabled?: boolean;
  initialData?: T;
};

type QueryState<T> = {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

export function usePollingQuery<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
  options: Options<T> = {},
): QueryState<T> {
  const { refreshInterval = 60000, enabled = true, initialData } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);

  const latestFetcher = useRef(fetcher);
  latestFetcher.current = fetcher;

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await latestFetcher.current();
      if (isMounted.current) {
        setData(result);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  useEffect(() => {
    if (!enabled || refreshInterval <= 0) return;
    const id = window.setInterval(() => {
      void refresh();
    }, refreshInterval);
    return () => window.clearInterval(id);
  }, [enabled, refreshInterval, refresh]);

  useEffect(() => {
    if (!enabled) return;
    const handleFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [enabled, refresh]);

  return { data, error, isLoading, refresh };
}
