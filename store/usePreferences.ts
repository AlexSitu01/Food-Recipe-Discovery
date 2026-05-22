import { create } from 'zustand';
import type { SwipeDirection, SwipeEvent } from '../types/recipe';

/**
 * In-memory store of the user's swipe history.
 *
 * The complete `swipes` array is the source of truth that will be POSTed to
 * the backend to fine-tune the user's preference model. `liked` / `disliked`
 * sets are derived helpers for fast lookups in the UI.
 */
interface PreferencesState {
  swipes: SwipeEvent[];
  liked: Set<string>;
  disliked: Set<string>;

  recordSwipe: (recipeId: string, direction: SwipeDirection) => void;
  isLiked: (recipeId: string) => boolean;
  isDisliked: (recipeId: string) => boolean;
  hasSeen: (recipeId: string) => boolean;
  reset: () => void;
}

export const usePreferences = create<PreferencesState>((set, get) => ({
  swipes: [],
  liked: new Set<string>(),
  disliked: new Set<string>(),

  recordSwipe: (recipeId, direction) =>
    set((state) => {
      const liked = new Set(state.liked);
      const disliked = new Set(state.disliked);
      if (direction === 'right') {
        liked.add(recipeId);
        disliked.delete(recipeId);
      } else {
        disliked.add(recipeId);
        liked.delete(recipeId);
      }
      return {
        swipes: [
          ...state.swipes,
          { recipeId, direction, timestamp: Date.now() },
        ],
        liked,
        disliked,
      };
    }),

  isLiked: (recipeId) => get().liked.has(recipeId),
  isDisliked: (recipeId) => get().disliked.has(recipeId),
  hasSeen: (recipeId) =>
    get().liked.has(recipeId) || get().disliked.has(recipeId),

  reset: () =>
    set({ swipes: [], liked: new Set(), disliked: new Set() }),
}));
