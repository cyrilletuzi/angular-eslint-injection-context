import type { ConfigObject, Plugin } from "@eslint/core";
import * as afterEveryRenderInInjectionContext from "./rules/after-every-render-in-injection-context.js";
import * as afterNextRenderInInjectionContext from "./rules/after-next-render-in-injection-context.js";
import * as afterRenderEffectInInjectionContext from "./rules/after-render-effect-in-injection-context.js";
import * as customFunctionInInjectionContext from "./rules/custom-function-in-injection-context.js";
import * as effectInInjectionContext from "./rules/effect-in-injection-context.js";
import * as injectAsyncInInjectionContext from "./rules/inject-async-in-injection-context.js";
import * as injectInInjectionContext from "./rules/inject-in-injection-context.js";
import * as pendingUntilEventInInjectionContext from "./rules/pending-until-event-in-injection-context.js";
import * as resourceInInjectionContext from "./rules/resource-in-injection-context.js";
import * as rxResourceInInjectionContext from "./rules/rx-resource-in-injection-context.js";
import * as signalFormInInjectionContext from "./rules/signal-form-in-injection-context.js";
import * as takeUntilDestroyedInInjectionContext from "./rules/take-until-destroyed-in-injection-context.js";
import * as toObservableInInjectionContext from "./rules/to-observable-in-injection-context.js";
import * as toSignalInInjectionContext from "./rules/to-signal-in-injection-context.js";

const { name, version } =
  // importing here would bypass the tsconfig `"rootDir": "src"`
  require("./package.json") as typeof import("./package.json");

const plugin = {
  configs: {
    get recommended() {
      return recommended;
    }
  },
  meta: { name, version },
  rules: {
    [injectInInjectionContext.ruleName]: injectInInjectionContext.ruleDefinition,
    [injectAsyncInInjectionContext.ruleName]: injectAsyncInInjectionContext.ruleDefinition,
    [takeUntilDestroyedInInjectionContext.ruleName]: takeUntilDestroyedInInjectionContext.ruleDefinition,
    [toSignalInInjectionContext.ruleName]: toSignalInInjectionContext.ruleDefinition,
    [toObservableInInjectionContext.ruleName]: toObservableInInjectionContext.ruleDefinition,
    [rxResourceInInjectionContext.ruleName]: rxResourceInInjectionContext.ruleDefinition,
    [resourceInInjectionContext.ruleName]: resourceInInjectionContext.ruleDefinition,
    [effectInInjectionContext.ruleName]: effectInInjectionContext.ruleDefinition,
    [afterEveryRenderInInjectionContext.ruleName]: afterEveryRenderInInjectionContext.ruleDefinition,
    [afterNextRenderInInjectionContext.ruleName]: afterNextRenderInInjectionContext.ruleDefinition,
    [afterRenderEffectInInjectionContext.ruleName]: afterRenderEffectInInjectionContext.ruleDefinition,
    [signalFormInInjectionContext.ruleName]: signalFormInInjectionContext.ruleDefinition,
    [pendingUntilEventInInjectionContext.ruleName]: pendingUntilEventInInjectionContext.ruleDefinition,
    [customFunctionInInjectionContext.ruleName]: customFunctionInInjectionContext.ruleDefinition,
  },
} satisfies Plugin;

const recommended: ConfigObject = {
  plugins: {
    [name]: plugin
  },
  rules: {
    [`${name}/${injectInInjectionContext.ruleName}`]: "error",
    [`${name}/${injectAsyncInInjectionContext.ruleName}`]: "error",
    [`${name}/${takeUntilDestroyedInInjectionContext.ruleName}`]: "error",
    [`${name}/${toSignalInInjectionContext.ruleName}`]: "error",
    [`${name}/${toObservableInInjectionContext.ruleName}`]: "error",
    [`${name}/${rxResourceInInjectionContext.ruleName}`]: "error",
    [`${name}/${resourceInInjectionContext.ruleName}`]: "error",
    [`${name}/${effectInInjectionContext.ruleName}`]: "error",
    [`${name}/${afterEveryRenderInInjectionContext.ruleName}`]: "error",
    [`${name}/${afterNextRenderInInjectionContext.ruleName}`]: "error",
    [`${name}/${afterRenderEffectInInjectionContext.ruleName}`]: "error",
    [`${name}/${signalFormInInjectionContext.ruleName}`]: "error",
    [`${name}/${pendingUntilEventInInjectionContext.ruleName}`]: "error",
  },
};

export = plugin;