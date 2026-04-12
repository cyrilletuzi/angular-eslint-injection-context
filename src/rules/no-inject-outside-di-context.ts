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

const DEPENDENCY_INJECTION_CONTEXT_DOC = "https://angular.dev/guide/di/dependency-injection-context";
const noInjectOutsideInjectionContextMessageId = "noInjectOutsideInjectionContext";
const noTakeUntilDestroyedWithoutInjectionContextMessageId = "noTakeUntilDestroyedWithoutInjectionContext";

function isInInjectionContext(node: TSESTree.Node, {
  includeFactories = false,
  includeAppInitializationFunctions = false,
} = {}): boolean {
  const parent: TSESTree.Node | undefined = node.parent;

  if (
    parent &&
    // Start with constructor and field initializer, as they are by far the most common case, to avoid useless checks
    (isInAngularClassInitialization(parent) ||
      // Special contexts (guard, resolver and interceptor) are the second most common case
      // 1. modern function syntax, 2. legacy class syntax, 3. directly inline inside a route
      isInFunctionTypeWithInjectionContext(parent, { includeAppInitializationFunctions }) ||
      isInMethodWithInjectionContext(parent) ||
      isInRoute(parent) ||
      // Factories
      (includeFactories && isInFactoryFunction(parent)) ||
      // Special functions like `runInInjectionContext` and some application providers
      isInFunctionWithInjectionContext(parent, { includeAppInitializationFunctions }) ||
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
      [noInjectOutsideInjectionContextMessageId]: `\`inject()\` must be called in an injection context. See more at https://angular.dev/api/core/inject and ${DEPENDENCY_INJECTION_CONTEXT_DOC}`,
      [noTakeUntilDestroyedWithoutInjectionContextMessageId]: `\`takeUntilDestroyed()\` must be called in an injection context, or a \`DestroyRef\` must be provided as the first argument. Documentation: https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed, https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed and ${DEPENDENCY_INJECTION_CONTEXT_DOC}`,
    },
    docs: {
      description: `Checks that functions requiring an injection context are indeed called in an injection context, or are called with an explicit injection context as an argument.`,
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        switch (node.callee.name) {
          case "inject": {
            if (!isInInjectionContext(node, { includeFactories: true, includeAppInitializationFunctions: true })) {
              context.report({
                node,
                messageId: noInjectOutsideInjectionContextMessageId,
              });
            }
            break;
          }
          case "takeUntilDestroyed": {
            /* Takes a `DestroyRef` as first argument: `takeUntilDestroyed(this.destroyRef)` */
            if (node.arguments.length === 0 && !isInInjectionContext(node)) {
              context.report({
                node,
                messageId: noTakeUntilDestroyedWithoutInjectionContextMessageId,
              });
            }
            break;
          }
        }
      },
    };
  },
};
