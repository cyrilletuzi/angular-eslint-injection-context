import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";
import { isCalledWithProperty } from "../utils/ast-call-argument";

export const ruleName = "signal-form-in-injection-context";
const messageId = "signalFormInInjectionContext";

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `\`form()\` must be called in an injection context, or an \`Injector\` must be provided in the second or third argument object.`,
    },
    docs: {
      description: `Checks that signal \`form()\` is called in an injection context, or is called with an explicit \`Injector\` as an argument.`,
      url: 'https://github.com/cyrilletuzi/angular-eslint-injection-context/blob/main/docs/rules/SIGNAL_FORM.md',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === "form" &&
          /* Takes an `Injector` in second or third argument object: `form(source, { injector })` or `form(source, schema, { injector })` */
          !(node.arguments.length === 3 && isCalledWithProperty(node, 2, 'injector')) &&
          !isCalledWithProperty(node, 1, 'injector') &&
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
