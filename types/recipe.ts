/**
 * Core recipe data shape used across the app.
 *
 * Future-facing fields like `tags` and `cuisine` are intentionally included
 * so the preference-fine-tuning algorithm has features to learn from once
 * the backend is wired up.
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  cuisine: string;
  tags: string[];
  difficulty: Difficulty;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  calories?: number;
  ingredients: Ingredient[];
  steps: string[];
  /** YouTube video ID (the v= query param), not the full URL. */
  youtubeVideoId: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
}

export type SwipeDirection = 'left' | 'right';

/**
 * Stored locally for now. Will later be sent to the backend to fine-tune
 * the user's preference model.
 */
export interface SwipeEvent {
  recipeId: string;
  direction: SwipeDirection;
  timestamp: number;
}
