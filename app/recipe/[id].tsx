import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';

import { getRecipeById } from '../../data/recipes';
import { usePreferences } from '../../store/usePreferences';
import { colors, radius, spacing, typography } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 320;
const VIDEO_HEIGHT = (SCREEN_WIDTH - spacing.lg * 2) * (9 / 16);

/**
 * Recipe detail screen. Reached either by tapping a card on the Feed,
 * or any row in the Liked / Explore / Search lists.
 */
export default function RecipeDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = getRecipeById(id ?? '');

  const liked = usePreferences((s) => s.isLiked(id ?? ''));
  const recordSwipe = usePreferences((s) => s.recordSwipe);

  const [videoPlaying, setVideoPlaying] = useState(false);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Recipe not found.</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.linkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl + insets.bottom }}
      >
        <View>
          <Image source={{ uri: recipe.imageUrl }} style={styles.hero} />
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { top: insets.top + spacing.sm }]}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={() => recordSwipe(recipe.id, liked ? 'left' : 'right')}
            style={[styles.heartButton, { top: insets.top + spacing.sm }]}
            hitSlop={8}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? colors.primary : colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.cuisine}>{recipe.cuisine}</Text>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.description}>{recipe.description}</Text>

          <View style={styles.metaRow}>
            <MetaCell icon="time-outline" label="Prep" value={`${recipe.prepTimeMinutes}m`} />
            <MetaCell icon="flame-outline" label="Cook" value={`${recipe.cookTimeMinutes}m`} />
            <MetaCell icon="people-outline" label="Serves" value={String(recipe.servings)} />
            <MetaCell
              icon="trending-up-outline"
              label="Level"
              value={recipe.difficulty}
            />
          </View>

          <Section title="Video walkthrough">
            <View style={styles.videoFrame}>
              <YoutubePlayer
                height={VIDEO_HEIGHT}
                play={videoPlaying}
                videoId={recipe.youtubeVideoId}
                onChangeState={(state) => {
                  if (state === 'ended') setVideoPlaying(false);
                }}
              />
            </View>
          </Section>

          <Section title="Ingredients">
            <View style={styles.ingredients}>
              {recipe.ingredients.map((ing, idx) => (
                <View key={`${ing.name}-${idx}`} style={styles.ingredientRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientQty}>{ing.quantity}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Steps">
            <View style={{ gap: spacing.sm }}>
              {recipe.steps.map((step, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </Section>

          <View style={styles.tags}>
            {recipe.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>#{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

interface MetaCellProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}

function MetaCell({ icon, label, value }: MetaCellProps) {
  return (
    <View style={styles.metaCell}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: colors.surface,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButton: {
    position: 'absolute',
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.lg,
  },
  cuisine: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginTop: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  metaCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metaValue: {
    ...typography.subheading,
    color: colors.text,
    textTransform: 'capitalize',
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.text,
  },
  videoFrame: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  ingredients: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  ingredientName: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  ingredientQty: {
    ...typography.caption,
    color: colors.textMuted,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    lineHeight: 21,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  tagText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  notFoundText: {
    ...typography.heading,
    color: colors.text,
  },
  linkText: {
    ...typography.body,
    color: colors.primary,
  },
});
