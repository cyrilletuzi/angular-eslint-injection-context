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
    angulareslintinjectioncontext.configs.recommended // ⬅️ add this
  ],
  rules: {},
});
```

## Rules

| Rule & documentation | in recommended |
|---|---|
| [no-inject-outside-di-context](./docs/NO_INJECT_OUTSIDE_DI_CONTEXT.md) | ✅ |
| [take-until-destroyed-in-injection-context](./docs/NO_INJECT_OUTSIDE_DI_CONTEXT.md) | ✅ |
| [to-observable-in-injection-context](./docs/NO_INJECT_OUTSIDE_DI_CONTEXT.md) | ✅ |
| [rx-resource-in-injection-context](./docs/NO_INJECT_OUTSIDE_DI_CONTEXT.md) | ✅ |
| [resource-in-injection-context](./docs/NO_INJECT_OUTSIDE_DI_CONTEXT.md) | ✅ |
| [effect-in-injection-context](./docs/NO_INJECT_OUTSIDE_DI_CONTEXT.md) | ✅ |
| [signal-form-in-injection-context](./docs/NO_INJECT_OUTSIDE_DI_CONTEXT.md) | ✅ |
| [pending-until-event-in-injection-context](./docs/NO_INJECT_OUTSIDE_DI_CONTEXT.md) | ✅ |

## FAQ

> Why not in Angular ESLint?

I proposed a [Pull Request](https://github.com/angular-eslint/angular-eslint/pull/2892), but it has been ignored for months now. So I decided to publish the rule by myself.

> Is Angular ESLint required?

No. When extracting the rule in its own repository, I took the opportunity to only depend on TypeScript ESLint.

> Is typed linting required?

[Typed linting](https://typescript-eslint.io/getting-started/typed-linting) is not required for now, but it could change in the future if it helps to do better rules.

> Will there be other rules?

Yes, very probably. `inject()` is not the only function requiring an injection context, which is becoming a very central concept in latest Angular versions.

> Where are the tests?

The tests are already done and passing in the Angular ESLint [Pull Request](https://github.com/angular-eslint/angular-eslint/pull/2892). I may migrate them here later, but it takes time and would not provide much value.

## License

MIT
