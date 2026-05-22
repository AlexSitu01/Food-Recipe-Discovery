import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { RECIPES } from '../../data/recipes';
import { RecipeListItem } from '../../components/RecipeListItem';
import { EmptyState } from '../../components/EmptyState';
import { colors, radius, spacing, typography } from '../../constants/theme';

/**
 * Free-text search across title, cuisine, and tags.
 *
 * For now this is pure client-side filtering against the mock dataset.
 * When the backend lands we'll swap in a debounced API call.
 */
export default function SearchScreen() {
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!trimmed) return [];
    return RECIPES.filter((r) => {
      const hay = [
        r.title,
        r.cuisine,
        r.description,
        ...r.tags,
        ...r.ingredients.map((i) => i.name),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(trimmed);
    });
  }, [trimmed]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Search</Text>
        <Text style={styles.title}>Find a recipe</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Pizza, pad thai, dessert..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      </View>

      {trimmed.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Start typing"
          body="Search by name, ingredient, cuisine, or tag."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon="sad-outline"
          title="No matches"
          body={`Nothing matched "${query}". Try a different keyword.`}
        />
      ) : (
        <FlatList
          data={results}
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
    paddingBottom: spacing.sm,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
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
