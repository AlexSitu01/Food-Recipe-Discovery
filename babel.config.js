module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Note: as of Expo SDK 54 / Reanimated 4, babel-preset-expo automatically
    // configures the worklets/reanimated plugin when react-native-reanimated
    // is installed. Adding it manually here would cause a duplicate-plugin
    // error at build time, so leave the plugins list empty.
  };
};
