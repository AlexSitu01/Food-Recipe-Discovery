import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SwipeDeck } from '../../components/SwipeDeck';
import { RECIPES } from '../../data/recipes';
import { usePreferences } from '../../store/usePreferences';
import { colors, spacing, typography } from '../../constants/theme';
import type { Recipe, SwipeDirection } from '../../types/recipe';

/**
 * The home Feed screen — Tinder-style swipe deck of recipes.
 *
 * We shuffle the deck once per mount and filter out anything the user has
 * already swiped on so they don't see duplicates. A "Reset" button rebuilds
 * the deck if the user wants to start over.
 */
export default function FeedScreen() {
  const hasSeen = usePreferences((s) => s.hasSeen);
  const recordSwipe = usePreferences((s) => s.recordSwipe);
  const reset = usePreferences((s) => s.reset);

  const [deckKey, setDeckKey] = useState(0);

  const deck = useMemo<Recipe[]>(() => {
    // Filter then shuffle. Using deckKey so a reset reshuffles too.
    const filtered = RECIPES.filter((r) => !hasSeen(r.id));
    return shuffle(filtered);
    // We deliberately exclude hasSeen from deps; we recompute only when the
    // deck is explicitly rebuilt via deckKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckKey]);

  const handleSwipe = useCallback(
    (recipe: Recipe, direction: SwipeDirection) => {
      recordSwipe(recipe.id, direction);
    },
    [recordSwipe],
  );

  const handleReset = useCallback(() => {
    reset();
    setDeckKey((k) => k + 1);
  }, [reset]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Discover</Text>
          <Text style={styles.title}>What sounds good?</Text>
        </View>
        <Pressable onPress={handleReset} hitSlop={8}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <SwipeDeck recipes={deck} onSwipe={handleSwipe} />
    </SafeAreaView>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  kicker: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
  resetText: {
    ...typography.subheading,
    color: colors.primary,
  },
});
