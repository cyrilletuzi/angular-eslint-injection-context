import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";

export const ruleName = "take-until-destroyed-in-injection-context";
const messageId = "takeUntilDestroyedInInjectionContext";

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`takeUntilDestroyed()\` must be called in an injection context, or a \`DestroyRef\` must be provided as the first argument. Documentation: https://angular.dev/ecosystem/rxjs-interop/take-until-destroyed`,
    },
    docs: {
      description: `Checks that \`takeUntilDestroyed()\` is called in an injection context, or is called with an explicit \`DestroyRef\` as an argument.`,
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== AST_NODE_TYPES.Identifier || node.callee.name !== "takeUntilDestroyed") {
          return;
        }

        /* Takes a `DestroyRef` as first argument: `takeUntilDestroyed(this.destroyRef)` */
        if (node.arguments.length < 1 && !isInInjectionContext(node)) {
          context.report({
            node,
            messageId,
          });
        }
      },
    };
  },
};
