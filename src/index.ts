import type { Plugin, ConfigObject } from "@eslint/core";
import { rule as noInjectOutsideDiContext } from "./rules/no-inject-outside-di-context.js";

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
    "no-inject-outside-di-context": noInjectOutsideDiContext,
  },
} satisfies Plugin;

const recommended: ConfigObject = {
  plugins: {
    "angular-eslint-injection-context": plugin
  },
  rules: {
    "angular-eslint-injection-context/no-inject-outside-di-context": "error"
  },
};

export = plugin;