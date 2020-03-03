module.exports = {
  env: {
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:json/recommended',
    'plugin:eslint-comments/recommended',
    'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'react-hooks',
    'promise',
    'eslint-comments',
    'json',
    'markdown',
    'async-await',
    'import',
  ],
  rules: {
    'import/no-unresolved': [0],
    'block-spacing': ['error', 'always'],
    camelcase: ['error'],
    'import/no-default-export': ['error'],
    'lines-around-comment': ['error'],
    'lines-between-class-members': ['error', 'always'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-mixed-spaces-and-tabs': ['error'],
    'no-multi-spaces': ['error'],
    'no-multiple-empty-lines': ['error'],
    'no-spaced-func': ['error'],
    'no-whitespace-before-property': ['error'],
    'space-before-blocks': ['error', 'always'],
    'spaced-comment': ['error', 'always', { markers: ['/'] }],
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
    // 'no-unused-vars': ['error'],
    // 'one-var': ["error", "always"],
    quotes: 'off',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'const', next: '*' },
      { blankLine: 'always', prev: '*', next: 'const' },
      { blankLine: 'always', prev: 'function', next: '*' },
      { blankLine: 'always', prev: '*', next: 'function' },
      { blankLine: 'always', prev: 'if', next: '*' },
      { blankLine: 'always', prev: '*', next: 'if' },
      { blankLine: 'always', prev: 'for', next: '*' },
      { blankLine: 'always', prev: '*', next: 'for' },
      { blankLine: 'always', prev: 'switch', next: '*' },
      { blankLine: 'always', prev: '*', next: 'switch' },
      { blankLine: 'always', prev: 'try', next: '*' },
      { blankLine: 'always', prev: '*', next: 'try' },
      { blankLine: 'always', prev: 'export', next: '*' },
      { blankLine: 'always', prev: '*', next: 'export' },
    ],
    // 'max-lines-per-function': [
    //   'error',
    //   { max: 20, skipBlankLines: true, skipComments: true, IIFEs: true },
    // ],
    'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    '@typescript-eslint/explicit-member-accessibility': [
      'off',
      {
        accessibility: 'explicit',
      },
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/member-delimiter-style': [
      'off',
      {
        multiline: {
          delimiter: 'none',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      },
    ],
    '@typescript-eslint/member-ordering': 'off',
    '@typescript-eslint/quotes': ['error', 'single'],
    '@typescript-eslint/semi': ['off', null],
    '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: false }],
    'arrow-parens': ['off', 'as-needed'],
    'import/order': 'off',
    'max-len': [
      'error',
      {
        code: 150,
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'styled-components',
            message: 'Please import from styled-components/macro.',
          },
        ],
        patterns: ['!styled-components/macro'],
      },
    ],
    'async-await/space-after-async': 2,
    'async-await/space-after-await': 2,
    'eslint-comments/disable-enable-pair': [
      'error',
      {
        allowWholeFile: true,
      },
    ],
  },
}
