import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";
import { isCalledWithProperty } from "../utils/ast-call-argument";

export const ruleName = "effect-in-injection-context";
const messageId = "effectInInjectionContext";

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`effect()\` must be called in an injection context, or an \`Injector\` must be provided in the second argument object. Documentation: https://angular.dev/guide/signals/effect`,
    },
    docs: {
      description: `Checks that \`effect()\` is called in an injection context, or is called with an explicit \`Injector\` as an argument.`,
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== AST_NODE_TYPES.Identifier || node.callee.name !== "effect") {
          return;
        }

        /* Takes an `Injector` in second argument object: `effect(() => {}, { injector })` */
        if (!isCalledWithProperty(node, 1, 'injector') && !isInInjectionContext(node)) {
          context.report({
            node,
            messageId,
          });
        }
      },
    };
  },
};
