import React, { useCallback } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { colors, radius, shadow, spacing, typography } from '../constants/theme';
import type { Recipe, SwipeDirection } from '../types/recipe';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.62;

/**
 * How far the card must travel horizontally (in px) before it commits
 * to a swipe. Below this threshold the card springs back to center.
 */
const SWIPE_COMMIT_X = SCREEN_WIDTH * 0.28;
/** Velocity threshold to commit a swipe even with little travel. */
const SWIPE_COMMIT_VELOCITY = 900;
/** Off-screen exit distance once a swipe is committed. */
const EXIT_DISTANCE = SCREEN_WIDTH * 1.5;

interface SwipeCardProps {
  recipe: Recipe;
  /** Stack position. 0 = top (interactive), 1 = behind, 2 = further back. */
  stackIndex: number;
  /** Fires after the card has fully animated off-screen. */
  onSwiped: (direction: SwipeDirection) => void;
}

/**
 * A single, gesturable recipe card. Lower cards in the stack get scaled
 * down and offset to create depth.
 */
function SwipeCardInner({ recipe, stackIndex, onSwiped }: SwipeCardProps) {
  const router = useRouter();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isInteractive = stackIndex === 0;

  const commit = useCallback(
    (direction: SwipeDirection) => {
      onSwiped(direction);
    },
    [onSwiped],
  );

  const openDetail = useCallback(() => {
    router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } });
  }, [router, recipe.id]);

  const panGesture = Gesture.Pan()
    .enabled(isInteractive)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const passedDistance = Math.abs(event.translationX) > SWIPE_COMMIT_X;
      const passedVelocity = Math.abs(event.velocityX) > SWIPE_COMMIT_VELOCITY;

      if (passedDistance || passedVelocity) {
        const direction: SwipeDirection =
          event.translationX > 0 ? 'right' : 'left';
        translateX.value = withTiming(
          direction === 'right' ? EXIT_DISTANCE : -EXIT_DISTANCE,
          { duration: 220 },
          (finished) => {
            if (finished) runOnJS(commit)(direction);
          },
        );
        translateY.value = withTiming(event.translationY, { duration: 220 });
      } else {
        translateX.value = withSpring(0, { damping: 18 });
        translateY.value = withSpring(0, { damping: 18 });
      }
    });

  // Treat a quick press without much drag as a tap to open detail.
  const tapGesture = Gesture.Tap()
    .enabled(isInteractive)
    .maxDeltaX(8)
    .maxDeltaY(8)
    .onEnd((_e, success) => {
      if (success) runOnJS(openDetail)();
    });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12],
      Extrapolation.CLAMP,
    );

    // Depth: cards behind the top one shrink and lift slightly.
    const baseScale = 1 - stackIndex * 0.05;
    const baseTranslateY = stackIndex * -10;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + baseTranslateY },
        { rotate: `${rotate}deg` },
        { scale: baseScale },
      ],
      zIndex: 100 - stackIndex,
    };
  }, [stackIndex]);

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_COMMIT_X],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const nopeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_COMMIT_X, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.card, cardStyle]} pointerEvents="box-none">
        <Image
          source={{ uri: recipe.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.gradient}
        />

        {isInteractive && (
          <>
            <Animated.View
              style={[styles.stamp, styles.likeStamp, likeOverlayStyle]}
              pointerEvents="none"
            >
              <Text style={styles.likeStampText}>YUM</Text>
            </Animated.View>
            <Animated.View
              style={[styles.stamp, styles.nopeStamp, nopeOverlayStyle]}
              pointerEvents="none"
            >
              <Text style={styles.nopeStampText}>NOPE</Text>
            </Animated.View>
          </>
        )}

        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.cuisineTag}>{recipe.cuisine}</Text>
            <View style={styles.metaInline}>
              <Ionicons name="time-outline" size={14} color={colors.textInverse} />
              <Text style={styles.metaText}>
                {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
              </Text>
            </View>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {recipe.description}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export const SwipeCard = React.memo(SwipeCardInner);

export const SWIPE_CARD_WIDTH = CARD_WIDTH;
export const SWIPE_CARD_HEIGHT = CARD_HEIGHT;

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadow.card,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  info: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cuisineTag: {
    color: colors.textInverse,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  metaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '500',
  },
  title: {
    ...typography.title,
    color: colors.textInverse,
  },
  description: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
  },
  stamp: {
    position: 'absolute',
    top: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 4,
    borderRadius: radius.md,
  },
  likeStamp: {
    right: spacing.lg,
    borderColor: colors.like,
    transform: [{ rotate: '-15deg' }],
  },
  nopeStamp: {
    left: spacing.lg,
    borderColor: colors.nope,
    transform: [{ rotate: '15deg' }],
  },
  likeStampText: {
    color: colors.like,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  nopeStampText: {
    color: colors.nope,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
