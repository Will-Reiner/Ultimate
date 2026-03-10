import { useEffect } from 'react';
import { useCategoryStore } from '../stores/categoryStore';

export function useCategories() {
  const categories = useCategoryStore((s) => s.categories);
  const isLoading = useCategoryStore((s) => s.isLoading);
  const error = useCategoryStore((s) => s.error);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, []);

  return { categories, isLoading, error, refresh: fetchCategories };
}
