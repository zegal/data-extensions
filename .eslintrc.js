module.exports = {
  env: {
    node: true,
    commonjs: true,
    es6: true,
  },
  extends: ["eslint:recommended", "prettier"],
  plugins: ["prettier"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-console": 0,
    "prettier/prettier": "error",
    "no-var": 1,
    // camelcase: [2, { properties: "always" }],
  },
};
