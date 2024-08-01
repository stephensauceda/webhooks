const globals = require('globals')
const pluginJs = require('@eslint/js')
const vitest = require('eslint-plugin-vitest')

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...vitest.environments.env.globals,
      },
    },
  },
  pluginJs.configs.recommended,
  {
    plugins: { vitest },
    rules: { ...vitest.configs.recommended.rules },
  },
]
