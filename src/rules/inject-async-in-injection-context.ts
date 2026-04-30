import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";

export const ruleName = "inject-async-in-injection-context";
const messageId = "injectAsyncInInjectionContext";

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`injectAsync()\` must be called in an injection context.`,
    },
    docs: {
      description: `Checks that \`injectAsync()\` is called in an injection context.`,
      url: 'https://github.com/cyrilletuzi/angular-eslint-injection-context/blob/main/docs/rules/INJECT_ASYNC.md',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === "injectAsync" &&
          !isInInjectionContext(node, {
            /* `injectAsync()` is accepted in all asynchronous-compatible injection contexts */
            includeRouting: true,
            includeHttp: true,
          })
        ) {
          context.report({
            node,
            messageId,
          });
        }
      },
    };
  },
};
