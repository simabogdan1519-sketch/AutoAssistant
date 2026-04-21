module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Notă: react-native-worklets/plugin e inclus automat în babel-preset-expo
    // începând cu SDK 54. NU îl adăuga manual — va duplica și va crea erori.
  };
};
