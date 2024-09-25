module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    ['@babel/preset-react', {runtime: 'automatic'}],
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
        },
      },
    ],
    ['@babel/plugin-transform-private-methods', {loose: true}],
  ],
};
