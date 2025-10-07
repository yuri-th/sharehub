module.exports = {
  root: true,
  env: { browser: true, node: true },
  extends: ["@nuxtjs", "plugin:nuxt/recommended", "plugin:vue/recommended"],
  parserOptions: {
    parser: "@babel/eslint-parser",
    requireConfigFile: false, // babel.configがなくてもOKにする
    sourceType: "module",
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": "off",
    "vue/multi-word-component-names": "off",
    semi: ["error", "always"], // セミコロン必須
    "space-before-function-paren": ["error", "never"],
    quotes: ["error", "double", { avoidEscape: true }],
    "comma-dangle": ["error", "always-multiline"], // 末尾カンマOK（複数行のみ）
  },
};
