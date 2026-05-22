import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RECIPES } from '../../data/recipes';
import { RecipeListItem } from '../../components/RecipeListItem';
import { EmptyState } from '../../components/EmptyState';
import { usePreferences } from '../../store/usePreferences';
import { colors, spacing, typography } from '../../constants/theme';

/**
 * Lists every recipe the user has swiped right on.
 */
export default function LikedScreen() {
  const liked = usePreferences((s) => s.liked);

  const likedRecipes = useMemo(
    () => RECIPES.filter((r) => liked.has(r.id)),
    [liked],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Saved</Text>
        <Text style={styles.title}>Your likes</Text>
        <Text style={styles.subtitle}>
          {likedRecipes.length === 0
            ? 'Recipes you swipe right on will live here.'
            : `${likedRecipes.length} recipe${likedRecipes.length === 1 ? '' : 's'} saved`}
        </Text>
      </View>

      {likedRecipes.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Nothing here yet"
          body="Swipe right on the Feed tab to save a recipe."
        />
      ) : (
        <FlatList
          data={likedRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecipeListItem recipe={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
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
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 72 + spacing.md * 2,
  },
});
