module.exports = {
  plugins: ['@typescript-eslint'],
  extends: ['next/core-web-vitals', 'eslint:recommended', 'plugin:@typescript-eslint/eslint-recommended' , 
    'airbnb', 'airbnb-typescript', 'prettier'],
  plugins: ["react", "prettier"],
  rules: {
    'no-console': [
      'error',
      {
        allow: ['error','trace','info','debug','warn'],
      },
    ],
    'prettier/prettier': 'error',
    'react-hooks/rules-of-hooks': 'off',
    'react/function-component-definition': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/forbid-prop-types': 'off',
    'react/require-default-props': [
      'error',
      {
        'ignoreFunctionalComponents': true
      }
    ],
    'react/no-array-index-key': 'off', //investigate
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off', //investigate
    'jsx-a11y/anchor-is-valid': 'off', //investigate
    'jsx-a11y/label-has-associated-control': 'off',
    '@typescript-eslint/no-unused-expressions': ['error', { 'allowTernary': true }],
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/return-await': 'off',
    'no-await-in-loop': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off'  
  },
  overrides: [
    {
      files: ['src/pages/api/**/*.ts', 'src/server/**/*'],
    },
  ],  
  parserOptions: {
    project: ['tsconfig.json']
  },
}
