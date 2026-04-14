import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";
import { INJECTION_CONTEXT_DOC_LINK } from "../utils/documentation-links";

export const ruleName = "take-until-destroyed-in-injection-context";
const messageId = "takeUntilDestroyedInInjectionContext";

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`takeUntilDestroyed()\` must be called in an injection context, or a \`DestroyRef\` must be provided as the first argument. Documentation: https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed, https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed and ${INJECTION_CONTEXT_DOC_LINK}`,
    },
    docs: {
      description: `Checks that functions requiring an injection context are indeed called in an injection context, or are called with an explicit injection context as an argument.`,
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
        if (node.arguments.length === 0 && !isInInjectionContext(node)) {
          context.report({
            node,
            messageId,
          });
        }
      },
    };
  },
};
