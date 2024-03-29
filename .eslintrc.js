module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:shopify/react',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint-recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    'import/no-unresolved': 'off',
  },
  overrides: [
    {
      files: ['*.test.*'],
      rules: {
        'shopify/jsx-no-hardcoded-content': 'off',
      },
    },
  ],
};
