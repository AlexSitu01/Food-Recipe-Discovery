import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { SwipeCard, SWIPE_CARD_HEIGHT } from './SwipeCard';
import { colors, radius, shadow, spacing, typography } from '../constants/theme';
import type { Recipe, SwipeDirection } from '../types/recipe';

/**
 * Number of cards rendered at once. Lower indices in the array are visually
 * behind. We only mount a few cards to keep memory usage low.
 */
const VISIBLE_CARDS = 3;

interface SwipeDeckProps {
  recipes: Recipe[];
  onSwipe: (recipe: Recipe, direction: SwipeDirection) => void;
  onEmpty?: () => void;
}

export function SwipeDeck({ recipes, onSwipe, onEmpty }: SwipeDeckProps) {
  const [index, setIndex] = useState(0);

  const handleSwiped = useCallback(
    (direction: SwipeDirection) => {
      const swiped = recipes[index];
      if (!swiped) return;
      onSwipe(swiped, direction);
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= recipes.length && onEmpty) {
          // Defer to next tick to avoid setState-in-callback warnings.
          setTimeout(onEmpty, 0);
        }
        return next;
      });
    },
    [index, recipes, onSwipe, onEmpty],
  );

  const visible = useMemo(
    () => recipes.slice(index, index + VISIBLE_CARDS),
    [recipes, index],
  );

  if (visible.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="restaurant-outline" size={64} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No more recipes</Text>
        <Text style={styles.emptyBody}>
          You've seen everything for now. Come back later for fresh ideas.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.deck}>
        {/* Render in reverse so the top card is mounted last and sits on top. */}
        {visible
          .map((recipe, stackIdx) => ({ recipe, stackIdx }))
          .reverse()
          .map(({ recipe, stackIdx }) => (
            <SwipeCard
              key={recipe.id}
              recipe={recipe}
              stackIndex={stackIdx}
              onSwiped={handleSwiped}
            />
          ))}
      </View>

      <View style={styles.actions}>
        <ActionButton
          icon="close"
          color={colors.nope}
          onPress={() => handleSwiped('left')}
        />
        <ActionButton
          icon="heart"
          color={colors.like}
          onPress={() => handleSwiped('right')}
        />
      </View>
    </View>
  );
}

interface ActionButtonProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  onPress: () => void;
}

function ActionButton({ icon, color, onPress }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { borderColor: color, opacity: pressed ? 0.7 : 1 },
      ]}
      hitSlop={8}
    >
      <Ionicons name={icon} size={28} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  deck: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SWIPE_CARD_HEIGHT,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingTop: spacing.md,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
});

// Reserved for future use if we want to expose radius from styles.
export const SWIPE_DECK_RADIUS = radius.xl;
