import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from '../constants/theme';

interface EmptyStateProps {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body?: string;
}

export function EmptyState({ icon = 'sparkles-outline', title, body }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
});
