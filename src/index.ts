import type { Plugin, ConfigObject } from "@eslint/core";
import * as noInjectOutsideDiContext from "./rules/no-inject-outside-di-context.js";

const { name, version } =
  // `import`ing here would bypass the TSConfig's `"rootDir": "src"`
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("../package.json") as typeof import("../package.json");

const plugin = {
  configs: {
    get recommended() {
      return recommended;
    }
  },
  meta: { name, version },
  rules: {
    [noInjectOutsideDiContext.ruleName]: noInjectOutsideDiContext.ruleDefinition,
  },
} satisfies Plugin;

const recommended: ConfigObject = {
  plugins: {
    [name]: plugin
  },
  rules: {
    [`${name}/${noInjectOutsideDiContext.ruleName}`]: "error"
  },
};

export = plugin;