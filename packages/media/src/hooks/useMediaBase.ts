import { useCallback, useRef, useState } from 'react';
import { Provider } from '../types/enums';

export interface ProviderError {
  provider: Provider;
  message: string;
  cause?: unknown;
}

export interface UseMediaBaseConfig {
  onSuccess?: (result: any) => void;
  onError?: (error: ProviderError) => void;
}

/**
 * Base hook for media generation
 * Provides shared state management and lifecycle handling
 * All provider-specific hooks should use this internally
 */
export function useMediaBase<T = any>(provider: Provider, config?: UseMediaBaseConfig) {
  const [result, setResult] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ProviderError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  const execute = useCallback(
    async (fn: (signal: AbortSignal) => Promise<T>): Promise<T> => {
      setIsLoading(true);
      setError(null);

      // Abort any pending request
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const result = await fn(ac.signal);
        setResult(result);
        config?.onSuccess?.(result);
        return result;
      } catch (e: any) {
        // Don't set error if request was aborted
        if (e.name === 'AbortError' || ac.signal.aborted) {
          throw e;
        }

        const providerError: ProviderError = {
          provider,
          message: e?.message || `${provider} error`,
          cause: e,
        };
        setError(providerError);
        config?.onError?.(providerError);
        throw providerError;
      } finally {
        // Only clear loading if this is still the active request
        if (abortRef.current === ac) {
          setIsLoading(false);
        }
      }
    },
    [provider, config]
  );

  return { result, isLoading, error, cancel, execute };
}
