const globals = require('globals')
const pluginJs = require('@eslint/js')
const vitest = require('eslint-plugin-vitest')

module.exports = [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  {
    plugins: { vitest },
    rules: { ...vitest.configs.recommended.rules },
  },
]
