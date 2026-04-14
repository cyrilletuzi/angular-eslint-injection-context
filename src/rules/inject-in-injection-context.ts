import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";
import { INJECTION_CONTEXT_DOC_LINK } from "../utils/documentation-links";

export const ruleName = "inject-in-injection-context";
const messageId = "injectInInjectionContext";

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`inject()\` must be called in an injection context. See more at https://angular.dev/api/core/inject and ${INJECTION_CONTEXT_DOC_LINK}`,
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
        if (node.callee.type !== AST_NODE_TYPES.Identifier || node.callee.name !== "inject") {
          return;
        }

        if (!isInInjectionContext(node, { includeFactories: true, includeAppInitializationFunctions: true })) {
          context.report({
            node,
            messageId,
          });
        }
      },
    };
  },
};
