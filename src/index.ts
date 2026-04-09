import { rule as noInjectOutsideDiContext } from "./rules/no-inject-outside-di-context.js";

const rules = {
  "no-inject-outside-di-context": noInjectOutsideDiContext,
};

const { name, version } =
  // `import`ing here would bypass the TSConfig's `"rootDir": "src"`
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("../package.json") as typeof import("../package.json");

const plugin = {
  configs: {
    get recommended() {
      return recommended;
    },
  },
  meta: { name, version },
  rules,
};

const recommended = {
  plugins: {
    "angular-eslint-injection-context": plugin,
  },
  rules,
};

export = plugin;