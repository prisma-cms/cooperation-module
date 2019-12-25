module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    "no-multiple-empty-lines": "off",
    "comma-dangle": "off",
    "space-before-function-paren": "off",
    "semi": "off",
    "padded-blocks": "off",
  }
}
