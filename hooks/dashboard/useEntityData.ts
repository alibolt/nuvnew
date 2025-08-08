import { useState, useEffect } from 'react';

interface UseEntityDataOptions {
  autoFetch?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseEntityDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useEntityData<T = any>(
  url: string,
  options: UseEntityDataOptions = {}
): UseEntityDataReturn<T> {
  const { autoFetch = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const jsonData = await response.json();
      setData(jsonData);
      onSuccess?.(jsonData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [url, autoFetch]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// Example usage:
// const { data: users, isLoading, error, refetch } = useEntityData<User[]>('/api/stores/subdomain/users');
// const { data: product, isLoading } = useEntityData<Product>(`/api/products/${productId}`, { 
//   onSuccess: (data) => console.log('Product loaded:', data) 
// });