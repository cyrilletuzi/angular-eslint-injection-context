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
      [messageId]: `\`toObservable()\` must be called in an injection context, or an \`Injector\` must be provided in the second argument object. Documentation: https://angular.dev/ecosystem/rxjs-interop#create-an-rxjs-observable-from-a-signal-with-toobservable`,
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
        if (node.callee.type !== AST_NODE_TYPES.Identifier || node.callee.name !== "toObservable") {
          return;
        }

        /* Takes an `Injector` in second argument object: `toObservable(source, { injector })` */
        if (!isCalledWithProperty(node, 1, 'injector') && !isInInjectionContext(node, { includeAsyncAppInitializationFunctions: true })) {
          context.report({
            node,
            messageId,
          });
        }
      },
    };
  },
};
