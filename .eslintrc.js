module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:tailwindcss/recommended'
  ],
  settings: {
    react: {
      version: '18.2.0'
    }
  },
  plugins: [
    'unused-imports',
    'react',
    'react-hooks',
    'tailwindcss'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'unused-imports/no-unused-imports': 'error',
    'no-duplicate-imports': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'tailwindcss/no-custom-classname': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'semi': ['error', 'never'],
    'quotes': ['error', 'single'],
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error'
  }
}; 