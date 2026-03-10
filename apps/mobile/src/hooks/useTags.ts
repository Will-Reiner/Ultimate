import { useEffect } from 'react';
import { useTagStore } from '../stores/tagStore';
import { useAuth } from './useAuth';

export function useTags() {
  const tags = useTagStore((s) => s.tags);
  const isLoading = useTagStore((s) => s.isLoading);
  const error = useTagStore((s) => s.error);
  const fetchTags = useTagStore((s) => s.fetchTags);
  const createTag = useTagStore((s) => s.createTag);
  const deleteTag = useTagStore((s) => s.deleteTag);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchTags();
    }
  }, [user?.id]);

  return { tags, isLoading, error, createTag, deleteTag, refresh: fetchTags };
}
