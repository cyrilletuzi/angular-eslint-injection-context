import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";

export const ruleName = "pending-until-event-in-injection-context";
const messageId = "pendingUntilEventInInjectionContext";

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`pendingUntilEvent()\` must be called in an injection context, or an \`Injector\` must be provided as the first argument. Documentation: https://angular.dev/api/core/rxjs-interop/pendingUntilEvent`,
    },
    docs: {
      description: `Checks that \`pendingUntilEvent()\` is called in an injection context, or is called with an explicit \`Injector\` as an argument.`,
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === "pendingUntilEvent" &&
          /* Takes an `Injector` as first argument: `pendingUntilEvent(this.injector)` */
          node.arguments.length < 1 && !isInInjectionContext(node, {
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
