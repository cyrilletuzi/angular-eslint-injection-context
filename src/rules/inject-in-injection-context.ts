import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";

export const ruleName = "inject-in-injection-context";
const messageId = "injectInInjectionContext";

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`inject()\` must be called in an injection context. Documentation: https://github.com/cyrilletuzi/angular-eslint-injection-context/blob/main/docs/rules/INJECT.md`,
    },
    docs: {
      description: `Checks that \`inject()\` is called in an injection context.`,
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== AST_NODE_TYPES.Identifier || node.callee.name !== "inject") {
          return;
        }

        if (!isInInjectionContext(node, { includeFactories: true, includeAsyncAppInitializationFunctions: true, includeSyncAppInitializationFunctions: true })) {
          context.report({
            node,
            messageId,
          });
        }
      },
    };
  },
};
