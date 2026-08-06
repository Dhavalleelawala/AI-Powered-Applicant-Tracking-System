import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Sync simple string filters to the URL query string.
 * Pass a stable defaults object (useMemo) from the caller.
 */
export function useUrlFilters(defaults) {
  const [params, setParams] = useSearchParams();
  const keys = useMemo(() => Object.keys(defaults), [defaults]);

  const values = useMemo(() => {
    const next = {};
    for (const key of keys) {
      const raw = params.get(key);
      next[key] = raw == null ? defaults[key] : raw;
    }
    return next;
  }, [params, keys, defaults]);

  const setFilter = useCallback(
    (key, value) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          const fallback = defaults[key] ?? '';
          if (value == null || String(value) === '' || String(value) === String(fallback)) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
          return next;
        },
        { replace: true }
      );
    },
    [defaults, setParams]
  );

  const clearFilters = useCallback(() => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const key of keys) next.delete(key);
        return next;
      },
      { replace: true }
    );
  }, [keys, setParams]);

  const activeCount = useMemo(
    () => keys.filter((key) => String(values[key] ?? '') !== String(defaults[key] ?? '')).length,
    [keys, values, defaults]
  );

  return { values, setFilter, clearFilters, activeCount };
}
