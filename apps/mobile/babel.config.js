module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@app-types': './src/types',
            '@services': './src/services',
            '@storage': './src/storage',
            '@stores': './src/stores',
            '@hooks': './src/hooks',
            '@components': './src/components',
          },
          extensions: ['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.json'],
        },
      ],
    ],
  };
};
