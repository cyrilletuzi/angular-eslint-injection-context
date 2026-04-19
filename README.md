# angular-eslint-injection-context

ESLint rules for Angular injection context.

**Checks that `inject()` and similar functions (`takeUntilDestroyed()`, `toSignal()`, `resource()`, `form()`...) are called in an injection context.**

Get the flexibility of the new Angular dependency injection system, but keep the _compilation_ safety, and say goodbye to the [`NG0203`](https://angular.dev/errors/NG0203) _runtime_ error: "`inject()` must be called from an injection context".

> [!NOTE]
> Find this tool useful? I’m open to freelance & full-time opportunities.
> Feel free to reach out on [LinkedIn](https://www.linkedin.com/in/cyrilletuzi/) or [Bluesky](https://bsky.app/profile/cyrilletuzi.com).

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
const tsEslint = require("typescript-eslint");
const angularEslintInjectionContext = require("angular-eslint-injection-context"); // ⬅️ add this

module.exports = defineConfig({
  files: ["**/*.ts"],
  languageOptions: {
    parserOptions: {
      projectService: true,
    },
  },
  extends: [
    eslint.configs.recommended,
    tsEslint.configs.strictTypeChecked,
    tsEslint.configs.stylisticTypeChecked,
    angularEslintInjectionContext.configs.recommended, // ⬅️ add this
  ],
  rules: {},
});
```

3. `npm run lint`

> [!NOTE]
> In VS Code, it may be required to restart for the ESLint extension to apply the new rules.

## Rules

| Rule & documentation | in recommended |
|---|---|
| [inject-in-injection-context](./docs/rules/INJECT.md) | ✅ |
| [effect-in-injection-context](./docs/rules/EFFECT.md) | ✅ |
| [signal-form-in-injection-context](./docs/rules/SIGNAL_FORM.md) | ✅ |
| [resource-in-injection-context](./docs/rules/RESOURCE.md) | ✅ |
| [rx-resource-in-injection-context](./docs/rules/RX_RESOURCE.md) | ✅ |
| [take-until-destroyed-in-injection-context](./docs/rules/TAKE_UNTIL_DESTROYED.md) | ✅ |
| [to-observable-in-injection-context](./docs/rules/TO_OBSERVABLE.md) | ✅ |
| [to-signal-in-injection-context](./docs/rules/TO_SIGNAL.md) | ✅ |
| [pending-until-event-in-injection-context](./docs/rules/PENDING_UNTIL_EVENT.md) | ✅ |
| [custom-function-in-injection-context](./docs/rules/CUSTOM_FUNCTION.md) | ❌ |

## FAQ

> Why not in Angular ESLint?

I proposed a [Pull Request](https://github.com/angular-eslint/angular-eslint/pull/2892), but it has been ignored for months now. So I decided to publish the rule by myself, and to add many more.

> Is Angular ESLint required?

No. When extracting the initial rule in its own repository, I took the opportunity to only depend on TypeScript ESLint.

> Is typed linting required?

[Typed linting](https://typescript-eslint.io/getting-started/typed-linting) is not required for now, but it could change in the future as some cases may require it.

> What difference with `@angular-eslint/no-implicit-take-until-destroyed`?

The Angular ESLint rule for `takeUntilDestroyed()` was the inspiration for all the rules in this package. The `angular-eslint-injection-context/take-until-destroyed-in-injection-context` version here is more accurate because it checks a lot more cases.

But they serve the same purpose, so it is not recommended to enable both of them at the same time. It is *not* enabled by default in Angular ESLint recommended preset; it *is* enabled by default in the recommended preset here.

> Can I check a custom function?

Yes, with the [`custom-function-in-injection-context`](./docs/rules/CUSTOM_FUNCTION.md) rule.

> Why not one rule for all functions?

First, to be able to disable specific rules if a project does not use some functions.

Second, because while similar, there are some differences in the functions signatures and in special contexts where a function makes sense or not.

Yes, with the [`custom-function-in-injection-context`](./docs/rules/CUSTOM_FUNCTION.md) rule.

> Where are the tests?

The tests are already done and passing in the Angular ESLint [Pull Request](https://github.com/angular-eslint/angular-eslint/pull/2892). I may migrate them here later, but it takes time.

## License

MIT
