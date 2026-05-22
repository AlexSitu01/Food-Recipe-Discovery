# Food Tinder

A Tinder-style mobile app for discovering recipes. Swipe right on dishes you'd like to cook, swipe left on the ones you'd skip. Tap any card for full ingredients, step-by-step instructions, and a YouTube video walkthrough.

Every swipe is recorded locally and is meant to feed a future personalization algorithm once the backend is wired up.

## Stack

- **Expo SDK 54** with the new architecture enabled (required for iOS)
- **React Native 0.81** + **React 19.1**
- **TypeScript** (strict)
- **Expo Router** v6 — file-based navigation
- **React Native Reanimated 4** + **Gesture Handler 2.28** for the swipe deck
- **react-native-worklets** — required peer dependency for Reanimated 4
- **Zustand** for in-memory swipe history
- **react-native-youtube-iframe** for embedded recipe videos

## Requirements

- **Node.js 20.19.4** or newer (SDK 54 requirement)
- **Xcode 26+** if building for iOS 26 / Liquid Glass
- macOS for native iOS builds, or use Expo Go for quick testing

## Project layout

```
app/
  _layout.tsx              # Stack root, wraps GestureHandlerRootView + SafeAreaProvider
  (tabs)/
    _layout.tsx            # Tab navigator
    index.tsx              # Feed (swipe deck)
    explore.tsx            # Browse by cuisine + featured carousel
    search.tsx             # Free-text search
    liked.tsx              # Saved (right-swiped) recipes
    profile.tsx            # Preferences placeholder
  recipe/
    [id].tsx               # Recipe detail (ingredients, steps, YouTube)
components/
  SwipeCard.tsx            # Single gesturable card
  SwipeDeck.tsx            # Card stack + action buttons
  RecipeListItem.tsx       # Row used in lists
  EmptyState.tsx           # Shared empty UI
constants/
  theme.ts                 # Colors, spacing, radii, typography
data/
  recipes.ts               # 25 mock recipes
store/
  usePreferences.ts        # Zustand store of swipes
types/
  recipe.ts                # Recipe + SwipeEvent types
```

## Running the app

If you are upgrading from a previous attempt, do a clean install first to wipe stale dependency resolutions:

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue

# macOS / Linux
rm -rf node_modules package-lock.json
```

Then:

```bash
# 1. Install dependencies
npm install

# 2. Let Expo lock every native module to the exact version SDK 54 expects
npx expo install --fix

# 3. (Optional) Validate the project against SDK 54's stricter checks
npx expo-doctor

# 4. Start the dev server
npm start
```

Then press:

- `i` — open the iOS simulator (requires Xcode)
- `a` — open the Android emulator
- `w` — open in the web browser

Or scan the QR code with the **Expo Go** app on a physical device.

## SDK 54 / iOS-specific notes

- **Reanimated v4** is in use, which depends on `react-native-worklets`. The Babel reanimated plugin is auto-added by `babel-preset-expo`, so `babel.config.js` deliberately leaves the plugins list empty — listing it manually causes a duplicate-plugin error.
- **New Architecture** is enabled in `app.json` (`newArchEnabled: true`). SDK 54 is the last release to support the legacy architecture, so this is the right default going forward.
- **iOS precompiled builds** ship with SDK 54, so `npx expo run:ios` is significantly faster than before.
- **Edge-to-edge** is enabled for Android. All screens use `SafeAreaView` from `react-native-safe-area-context` (the `react-native` version is deprecated as of RN 0.81) so insets are handled correctly.
- **Stricter app.json schema**: `statusBar` is no longer accepted at the root or under `android`. Use the `expo-status-bar` component (already wired up in `app/_layout.tsx`) instead.
- **App icons / splash assets** were removed from `app.json` so the project boots out of the box. Drop your own files into `assets/` and re-add the references when you're ready.

## How the swipe works

`components/SwipeCard.tsx` uses a `Gesture.Pan` from `react-native-gesture-handler`. The card's translation is held in `useSharedValue`s, and `useAnimatedStyle` interpolates rotation and overlay opacity off the X translation. On gesture end we decide:

- **Commit (left or right)** if the card has traveled past `SWIPE_COMMIT_X` OR moved faster than `SWIPE_COMMIT_VELOCITY` — we then `withTiming` the card off-screen and call back into JS with `runOnJS(commit)(direction)`.
- **Snap back** otherwise, with a critically damped `withSpring`.

`components/SwipeDeck.tsx` keeps a simple `index` cursor and renders only the top three cards. Lower cards in the stack get scaled and offset slightly to suggest depth.

## How preferences are stored

`store/usePreferences.ts` keeps three pieces of state:

```ts
swipes: SwipeEvent[]    // full history, in order
liked: Set<string>      // recipeIds right-swiped
disliked: Set<string>   // recipeIds left-swiped
```

The full `swipes` array is the source of truth that the future backend will receive to fine-tune the user's personalization model. `liked` and `disliked` are derived for fast UI lookups (`isLiked`, `hasSeen`, etc.).

## Mock data

`data/recipes.ts` ships 25 recipes spanning Italian, Japanese, Thai, Indian, Mexican, American, French, Greek, Vietnamese, Korean, Middle Eastern, and Chinese cuisines. Each recipe has:

- Image (Unsplash)
- Cuisine, tags, difficulty
- Prep/cook time, servings, calories
- Ingredients and step-by-step instructions
- YouTube video ID

Swap this file out for an API client later without touching the UI.

## Next steps (backend pass)

- Replace `data/recipes.ts` with an API client (`fetchFeed`, `getRecipe`).
- Persist `swipes` to the server and use them to drive a personalized feed query.
- Add auth and replace the placeholder profile.
- Persist preferences across sessions (e.g., MMKV or AsyncStorage).
