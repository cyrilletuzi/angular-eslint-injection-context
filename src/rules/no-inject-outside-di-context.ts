import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { isInAngularClassInitialization } from "../utils/angular-class-initialization";
import { isInFactoryFunction } from "../utils/angular-factory";
import { isInFunctionTypeWithInjectionContext } from "../utils/angular-function-type-with-injection-context";
import { isInFunctionWithInjectionContext } from "../utils/angular-function-with-injection-context";
import { isInjectionContextAsserted } from "../utils/angular-injection-context-assertion";
import { isInMethodWithInjectionContext } from "../utils/angular-method-with-injection-context";
import { isInRoute } from "../utils/angular-route";

export const ruleName = "no-inject-outside-di-context";

export const INJECT_DOC = "https://angular.dev/api/core/inject";
export const DEPENDENCY_INJECTION_CONTEXT_DOC =
  "https://angular.dev/guide/di/dependency-injection-context";

function isInjectInInjectionContext(node: TSESTree.Node): boolean {
  const parent: TSESTree.Node | undefined = node.parent;

  if (
    parent &&
    // Start with constructor and field initializer, as they are by far the most common case, to avoid useless checks
    (isInAngularClassInitialization(parent) ||
      // Special contexts (guard, resolver and interceptor) are the second most common case
      // 1. modern function syntax, 2. legacy class syntax, 3. directly inline inside a route
      isInFunctionTypeWithInjectionContext(parent, { includeAppInitializationFunctions: true }) ||
      isInMethodWithInjectionContext(parent) ||
      isInRoute(parent) ||
      // Factories
      isInFactoryFunction(parent) ||
      // Special functions like `runInInjectionContext` and some application providers
      isInFunctionWithInjectionContext(parent, { includeAppInitializationFunctions: true }) ||
      // Custom injectable functions where context is asserted
      isInjectionContextAsserted(parent))
  ) {
    return true;
  }

  return false;
}

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: "problem",
    messages: {
      noInjectOutsideDiContext: `\`inject()\` must be called in an injection context. See more at ${INJECT_DOC} and ${DEPENDENCY_INJECTION_CONTEXT_DOC}`,
    },
    docs: {
      description: `Ensures that \`inject()\` is called in an injection context`,
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type !== AST_NODE_TYPES.Identifier ||
          node.callee.name !== "inject" ||
          isInjectInInjectionContext(node)
        ) {
          return;
        }

        context.report({
          node,
          messageId: "noInjectOutsideDiContext",
        });
      },
    };
  },
};
