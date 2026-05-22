import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { colors, radius, spacing, typography } from '../constants/theme';
import type { Recipe } from '../types/recipe';

interface RecipeListItemProps {
  recipe: Recipe;
}

/**
 * Compact horizontal row used in lists (Liked, Search, Explore).
 * Tapping pushes the recipe detail screen.
 */
export function RecipeListItem({ recipe }: RecipeListItemProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })
      }
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Image source={{ uri: recipe.imageUrl }} style={styles.thumb} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.title}
        </Text>
        <Text style={styles.cuisine}>{recipe.cuisine}</Text>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>
            {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
          </Text>
          <Ionicons
            name="flame-outline"
            size={13}
            color={colors.textMuted}
            style={{ marginLeft: spacing.sm }}
          />
          <Text style={styles.metaText}>{recipe.difficulty}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.subheading,
    color: colors.text,
  },
  cuisine: {
    ...typography.caption,
    color: colors.primary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
});
