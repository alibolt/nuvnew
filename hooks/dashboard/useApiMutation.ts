import { useState, useCallback } from 'react';

interface UseApiMutationOptions<TData = any, TError = any> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onSettled?: () => void;
}

interface UseApiMutationReturn<TVariables, TData> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data: TData | null;
  error: Error | null;
  reset: () => void;
}

export function useApiMutation<TVariables = any, TData = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiMutationOptions<TData> = {}
): UseApiMutationReturn<TVariables, TData> {
  const { onSuccess, onError, onSettled } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
    setIsSuccess(false);
    setData(null);
    setError(null);
  }, []);

  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);
    setError(null);
    
    try {
      const result = await mutationFn(variables);
      setData(result);
      setIsSuccess(true);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      setIsError(true);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
      onSettled?.();
    }
  }, [mutationFn, onSuccess, onError, onSettled]);

  const mutate = useCallback((variables: TVariables): Promise<TData> => {
    return mutateAsync(variables).catch(() => {
      // Error is already handled in mutateAsync
      // This just prevents unhandled promise rejection
      return null as any;
    });
  }, [mutateAsync]);

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
  };
}

// Utility function for common API operations
export function createApiMutation<TVariables = any, TData = any>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
  return useApiMutation<TVariables, TData>(async (variables) => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'DELETE' ? JSON.stringify(variables) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json();
  });
}

// Example usage:
// const { mutate, isLoading, isError, data } = useApiMutation(
//   async (productData) => {
//     const response = await fetch('/api/products', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(productData)
//     });
//     if (!response.ok) throw new Error('Failed to create product');
//     return response.json();
//   },
//   {
//     onSuccess: (data) => {
//       console.log('Product created:', data);
//       router.push(`/products/${data.id}`);
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     }
//   }
// );
//
// // Or use the utility function:
// const updateProduct = createApiMutation<Product, Product>('/api/products/123', 'PUT');
// const deleteProduct = createApiMutation('/api/products/123', 'DELETE');