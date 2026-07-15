import { useState, useCallback } from 'react';
import { Team } from '../services/types';

export function useFavoriteTeams() {
  const [favorites, setFavorites] = useState<Team[]>(() => {
    try {
      const stored = localStorage.getItem('sportshub_favteams');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  const toggleFavorite = useCallback((team: Team) => {
    setFavorites((prev) => {
      const isFav = prev.some((t) => t.id === team.id);
      const next = isFav 
        ? prev.filter((t) => t.id !== team.id)
        : [...prev, team];
      
      localStorage.setItem('sportshub_favteams', JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((teamId: string) => {
    return favorites.some((t) => t.id === teamId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
