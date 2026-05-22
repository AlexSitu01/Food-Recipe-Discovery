import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { RECIPES } from '../../data/recipes';
import { RecipeListItem } from '../../components/RecipeListItem';
import { colors, radius, shadow, spacing, typography } from '../../constants/theme';
import type { Recipe } from '../../types/recipe';

/**
 * Browse-style page. A horizontal chip row of cuisines filters a vertical
 * list of recipes, with a "Featured" carousel up top.
 */
export default function ExploreScreen() {
  const router = useRouter();
  const [activeCuisine, setActiveCuisine] = useState<string>('All');

  const cuisines = useMemo<string[]>(() => {
    const set = new Set<string>(RECIPES.map((r) => r.cuisine));
    return ['All', ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    if (activeCuisine === 'All') return RECIPES;
    return RECIPES.filter((r) => r.cuisine === activeCuisine);
  }, [activeCuisine]);

  // Featured = first 6 recipes, deterministic across renders.
  const featured = useMemo(() => RECIPES.slice(0, 6), []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeListItem recipe={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.titleBlock}>
              <Text style={styles.kicker}>Explore</Text>
              <Text style={styles.title}>Find your next meal</Text>
            </View>

            <Text style={styles.sectionLabel}>Featured</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {featured.map((recipe) => (
                <FeaturedCard
                  key={recipe.id}
                  recipe={recipe}
                  onPress={() =>
                    router.push({
                      pathname: '/recipe/[id]',
                      params: { id: recipe.id },
                    })
                  }
                />
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Cuisine</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {cuisines.map((c) => {
                const active = c === activeCuisine;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setActiveCuisine(c)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>
              {activeCuisine === 'All' ? 'All Recipes' : activeCuisine}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

interface FeaturedCardProps {
  recipe: Recipe;
  onPress: () => void;
}

function FeaturedCard({ recipe, onPress }: FeaturedCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.featured, pressed && { opacity: 0.85 }]}>
      <Image source={{ uri: recipe.imageUrl }} style={styles.featuredImage} />
      <View style={styles.featuredBody}>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.featuredMeta}>
          {recipe.cuisine} · {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  titleBlock: {
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
  sectionLabel: {
    ...typography.subheading,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  carousel: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  featured: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  featuredImage: {
    width: '100%',
    height: 130,
  },
  featuredBody: {
    padding: spacing.sm,
    gap: 2,
  },
  featuredTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  featuredMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chips: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 72 + spacing.md * 2,
  },
});
