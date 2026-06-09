module.exports = function (api) {
  api.cache(true)
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
    // Reanimated v4 splits its babel transform into the worklets package.
    plugins: ['react-native-worklets/plugin'],
  }
}
