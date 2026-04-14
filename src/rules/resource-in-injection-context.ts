import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";
import { isCalledWithProperty } from "../utils/ast-call-argument";

export const ruleName = "resource-in-injection-context";
const messageId = `resourceInInjectionContext`;

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`resource()\` must be called in an injection context, or an \`Injector\` must be provided in the argument object. Documentation: https://angular.dev/api/core/resource`,
    },
    docs: {
      description: `Checks that \`resource()\` is called in an injection context, or is called with an explicit \`Injector\` as an argument.`,
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== AST_NODE_TYPES.Identifier || node.callee.name !== "resource") {
          return;
        }

        /* Takes an `Injector` in argument: `resource({ loader, injector })` */
        if (!isCalledWithProperty(node, 0, 'injector') && !isInInjectionContext(node)) {
          context.report({
            node,
            messageId,
          });
        }
      },
    };
  },
};
