# angular-eslint-injection-context

ESLint rules for Angular injection context.

## Requirements

- TypeScript ESLint v8
- New flat ESLint configuration (`eslint.config.js` or equivalent)

> [!NOTE]
> `.eslintrc.json` and other legacy ESLint configurations are not supported

## Getting started

1. Installation

```bash
npm install angular-eslint-injection-context --save-dev
```

2. ESLint flat configuration (`eslint.config.js` or equivalent)

```js
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angulareslint = require("angular-eslint");
const angulareslintinjectioncontext = require("angular-eslint-injection-context"); // ⬅️ add this

module.exports = defineConfig({
  files: ["**/*.ts"],
  languageOptions: {
    parserOptions: {
      projectService: true,
    },
  },
  extends: [
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    angulareslint.configs.tsRecommended,
    angulareslintinjectioncontext.configs.recommended // ⬅️ add this
  ],
  processor: angulareslint.processInlineTemplates,
  rules: {},
});
```