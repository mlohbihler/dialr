module.exports = {
  root: true,
  extends: 'standard',
  env: {
    jest: true,
    node: true,
    es6: true
  },
  rules: {
    // Custom overrides
    "space-before-function-paren": ['error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always'
    }],
    'comma-dangle': 'off',
    'func-call-spacing': 'off'
  }
};