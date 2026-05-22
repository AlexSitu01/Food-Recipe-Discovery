import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { usePreferences } from '../../store/usePreferences';
import { colors, radius, spacing, typography } from '../../constants/theme';

/**
 * Profile + preferences placeholder. Values here are stored only in local
 * component state for now — wiring them into the recommendation algorithm
 * will happen on the backend pass.
 */
const CUISINE_OPTIONS = [
  'Italian',
  'Japanese',
  'Thai',
  'Mexican',
  'Indian',
  'American',
  'French',
  'Mediterranean',
  'Korean',
  'Vietnamese',
];

const DIET_OPTIONS = ['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-free', 'Dairy-free'];

export default function ProfileScreen() {
  const liked = usePreferences((s) => s.liked);
  const disliked = usePreferences((s) => s.disliked);
  const swipes = usePreferences((s) => s.swipes);
  const reset = usePreferences((s) => s.reset);

  const [selectedCuisines, setSelectedCuisines] = useState<Set<string>>(new Set());
  const [selectedDiets, setSelectedDiets] = useState<Set<string>>(new Set());
  const [spicy, setSpicy] = useState(true);
  const [quickOnly, setQuickOnly] = useState(false);

  const toggle = (set: Set<string>, value: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset preferences?',
      'This clears all your swipes (but keeps your filters).',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: reset },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBlock}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.textInverse} />
          </View>
          <Text style={styles.name}>Food Explorer</Text>
          <Text style={styles.subtitle}>Tune your taste profile</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Swiped" value={swipes.length} />
          <Stat label="Liked" value={liked.size} />
          <Stat label="Passed" value={disliked.size} />
        </View>

        <Text style={styles.sectionLabel}>Favorite cuisines</Text>
        <View style={styles.chipWrap}>
          {CUISINE_OPTIONS.map((c) => {
            const active = selectedCuisines.has(c);
            return (
              <Pressable
                key={c}
                onPress={() => toggle(selectedCuisines, c, setSelectedCuisines)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Dietary preferences</Text>
        <View style={styles.chipWrap}>
          {DIET_OPTIONS.map((d) => {
            const active = selectedDiets.has(d);
            return (
              <Pressable
                key={d}
                onPress={() => toggle(selectedDiets, d, setSelectedDiets)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {d}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Filters</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>I like spicy food</Text>
          <Switch
            value={spicy}
            onValueChange={setSpicy}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Quick meals only (under 30 min)</Text>
          <Switch
            value={quickOnly}
            onValueChange={setQuickOnly}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <Pressable onPress={confirmReset} style={styles.resetButton}>
          <Ionicons name="refresh" size={16} color={colors.primary} />
          <Text style={styles.resetText}>Reset all swipes</Text>
        </Pressable>

        <Text style={styles.footnote}>
          Preferences here are stored locally for now. Once the backend is
          live they'll feed directly into your personalized recipe feed.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface StatProps {
  label: string;
  value: number;
}

function Stat({ label, value }: StatProps) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  headerBlock: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.heading,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.title,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionLabel: {
    ...typography.subheading,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resetText: {
    ...typography.subheading,
    color: colors.primary,
  },
  footnote: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
