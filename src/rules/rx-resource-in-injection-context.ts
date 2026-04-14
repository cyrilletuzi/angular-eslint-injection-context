import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";
import { isCalledWithProperty } from "../utils/ast-call-argument";

export const ruleName = "rx-resource-in-injection-context";
const messageId = `rxResourceInInjectionContext`;

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`rxResource()\` must be called in an injection context, or an \`Injector\` must be provided in the argument object. Documentation: https://angular.dev/api/core/rxjs-interop/rxResource`,
    },
    docs: {
      description: `Checks that \`rxResource()\` is called in an injection context, or is called with an explicit \`Injector\` as an argument.`,
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== AST_NODE_TYPES.Identifier || node.callee.name !== "rxResource") {
          return;
        }

        /* Takes an `Injector` in second argument object: `toObservable(source, { injector })` */
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
