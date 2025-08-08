'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CategoryManager({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/stores/${storeId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create category');
      } else {
        setSuccess('Category created successfully!');
        setCategoryName('');
        setTimeout(() => {
          router.refresh();
          setSuccess('');
        }, 1500);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Add New Category
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
            Category Name
          </label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
            placeholder="e.g., Electronics, Clothing"
            required
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !categoryName.trim()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8B9F7E] hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Tips</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Categories help customers find products easily</li>
          <li>• Use clear, descriptive names</li>
          <li>• You can assign products to categories later</li>
        </ul>
      </div>
    </div>
  );
}