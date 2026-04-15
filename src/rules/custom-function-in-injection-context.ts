import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInInjectionContext } from "../utils/angular-injection-context";
import { isCalledWithProperty } from "../utils/ast-call-argument";

export const ruleName = "custom-function-in-injection-context";
const messageId = `customFunctionInInjectionContext`;

type SpecialInjectionContext = "routing" | "http" | "factory" | "observable" | "applicationInitialization";

interface FunctionConfig {
  readonly functionName: string;
  readonly argumentPosition: number;
  readonly argumentPropertyName?: string | undefined;
  readonly allowedSpecialInjectionContexts?: readonly SpecialInjectionContext[];
}

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      [messageId]: `This function must be called in an injection context, or an explicit injection context must be provided as an argument.`,
    },
    docs: {
      description: `Checks that a function is called in an injection context, or that an explicit injection context is provided as an argument.`,
      url: 'https://github.com/cyrilletuzi/angular-eslint-injection-context/blob/main/docs/rules/CUSTOM_FUNCTION.md',
    },
    schema: [{
      type: "array",
      minItems: 1,
      description: "List of the functions to check.",
      items: {
        type: "object",
        additionalProperties: false,
        description: "Configuration of a functions to check.",
        properties: {
          functionName: {
            type: "string",
            minLength: 1,
            description: "Name of the function to check, for example 'customInject'.",
          },
          argumentPosition: {
            type: "number",
            minimum: 0,
            description: "0-based position of the argument in which it is possible to pass an explicit injection context."
          },
          argumentPropertyName: {
            type: "string",
            minLength: 1,
            description: "If the explicit injection context argument is an object, the name of the property, for example 'injector'. If not provided, the rule will consider the argument is directly the explicit injection context."
          },
          allowedSpecialInjectionContexts: {
            type: "array",
            description: "List of special injection contexts to allow.",
            items: {
              type: "string",
              enum: ["routing", "http", "factory", "observable", "applicationInitialization"],
              description: "Special injection contexts to allow: routing features, HTTP features, factories or contexts accepting observables.",
            },
          },
        },
        required: ["functionName", "argumentPosition"],
      },
    }],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        const functionsToCheck = context.options[0] as readonly FunctionConfig[];

        for (const functionToCheck of functionsToCheck) {
          if (
            node.callee.type === AST_NODE_TYPES.Identifier &&
            node.callee.name === functionToCheck.functionName
          ) {
            if ((
              functionToCheck.argumentPropertyName !== undefined && !isCalledWithProperty(node, functionToCheck.argumentPosition, functionToCheck.argumentPropertyName) ||
              node.arguments.length < functionToCheck.argumentPosition + 1
            ) &&
              !isInInjectionContext(node, {
                includeRouting: functionToCheck.allowedSpecialInjectionContexts?.includes("routing") ?? false,
                includeHttp: functionToCheck.allowedSpecialInjectionContexts?.includes("http") ?? false,
                includeFactories: functionToCheck.allowedSpecialInjectionContexts?.includes("factory") ?? false,
                includeAsyncAppInitializationFunctions: functionToCheck.allowedSpecialInjectionContexts?.includes("observable") ?? false,
                includeSyncAppInitializationFunctions: functionToCheck.allowedSpecialInjectionContexts?.includes("applicationInitialization") ?? false,
              })) {
              context.report({
                node,
                messageId,
              });
            }
            /* No need to check other functions names if one has already matched */
            break;
          }
        }
      },
    };
  },
};
