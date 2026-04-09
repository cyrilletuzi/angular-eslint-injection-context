import { ESLintUtils } from "@typescript-eslint/utils";

export interface ExampleLintingRuleDocs {
  readonly description: string;
  readonly recommended?: boolean;
  readonly requiresTypeChecking?: boolean;
}

export const createRule = ESLintUtils.RuleCreator<ExampleLintingRuleDocs>(
  (name) =>
    `https://github.com/cyrilletuzi/angular-eslint-injection-context/tree/main/docs/${name}.md`
);