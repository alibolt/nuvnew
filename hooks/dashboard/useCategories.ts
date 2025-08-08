import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
}

export function useCategories(subdomain: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stores/${subdomain}/categories`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      fetchCategories();
    }
  }, [subdomain]);

  return { categories, loading, error };
}