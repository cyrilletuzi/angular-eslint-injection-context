import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";

export const ruleName = "take-until-destroyed-in-injection-context";
const messageId = "takeUntilDestroyedInInjectionContext";

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`takeUntilDestroyed()\` must be called in an injection context, or a \`DestroyRef\` must be provided as the first argument.`,
    },
    docs: {
      description: `Checks that \`takeUntilDestroyed()\` is called in an injection context, or is called with an explicit \`DestroyRef\` as an argument.`,
      url: 'https://github.com/cyrilletuzi/angular-eslint-injection-context/blob/main/docs/rules/TAKE_UNTIL_DESTROYED.md',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === "takeUntilDestroyed" &&
          /* Takes a `DestroyRef` as first argument: `takeUntilDestroyed(this.destroyRef)` */
          node.arguments.length < 1 &&
          !isInInjectionContext(node, {
            includeRouting: true,
            includeHttp: true,
            includeAsyncAppInitializationFunctions: true,
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
