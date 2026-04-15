import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";
import { isCalledWithProperty } from "../utils/ast-call-argument";

export const ruleName = "to-signal-in-injection-context";
const messageId = "toSignalInInjectionContext";

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`toSignal()\` must be called in an injection context, or an \`Injector\` must be provided in the second argument object, or \`manualCleanup\` must be enabled.`,
    },
    docs: {
      description: `Checks that \`toSignal()\` is called in an injection context, or is called with an explicit \`Injector\` or \`manualCleanup\` as an argument.`,
      url: 'https://github.com/cyrilletuzi/angular-eslint-injection-context/blob/main/docs/rules/TO_SIGNAL.md',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === "toSignal" &&
          /* Takes an `Injector` or `manualCleanup` in second argument object: `toSignal(obs, { injector })` or `toSignal(obs, { manualCleanup })` */
          !isCalledWithProperty(node, 1, 'injector') &&
          !isCalledWithProperty(node, 1, 'manualCleanup') &&
          !isInInjectionContext(node)
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
