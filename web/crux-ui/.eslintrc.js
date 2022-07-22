module.exports = {
  plugins: ['@typescript-eslint'],
  extends: ['next/core-web-vitals', 'prettier', 'eslint:recommended', 'plugin:@typescript-eslint/eslint-recommended'],
  rules: {
    'react-hooks/rules-of-hooks': 'off',
    'no-console': [
      'error',
      {
        allow: ['error','trace','info','debug','warn'],
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': ['off'],
  },
  overrides: [
    {
      files: ['src/pages/api/**/*.ts', 'src/server/**/*'],
    },
  ],
}
