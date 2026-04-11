import type { ConfigObject, Plugin } from "@eslint/core";
import * as noInjectOutsideDiContext from "./rules/no-inject-outside-di-context.js";

const { name, version } =
  // importing here would bypass the tsconfig `"rootDir": "src"`
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