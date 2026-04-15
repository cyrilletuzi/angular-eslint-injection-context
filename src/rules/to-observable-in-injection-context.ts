import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";
import { isCalledWithProperty } from "../utils/ast-call-argument";

export const ruleName = "to-observable-in-injection-context";
const messageId = "toObservableInInjectionContext";

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`toObservable()\` must be called in an injection context, or an \`Injector\` must be provided in the second argument object. Documentation: https://github.com/cyrilletuzi/angular-eslint-injection-context/blob/main/docs/rules/TO_OBSERVABLE.md`,
    },
    docs: {
      description: `Checks that \`toObservable()\` is called in an injection context, or is called with an explicit \`Injector\` as an argument.`,
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === "toObservable" &&
          /* Takes an `Injector` in second argument object: `toObservable(source, { injector })` */
          !isCalledWithProperty(node, 1, 'injector') &&
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
