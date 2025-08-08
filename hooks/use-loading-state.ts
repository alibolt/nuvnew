import { useState, useCallback } from 'react';

interface UseLoadingStateOptions {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export function useLoadingState(options?: UseLoadingStateOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async <T,>(
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      options?.onSuccess?.();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      options?.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);
  
  return {
    isLoading,
    error,
    execute,
    reset,
  };
}