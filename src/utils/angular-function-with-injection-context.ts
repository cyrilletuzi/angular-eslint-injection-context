import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { findNearestAncestorOf } from "./ast-traversal";
import { isAfterAwait } from "./await-detection";

export function isInFunctionWithInjectionContext(node: TSESTree.Node, { includeAppInitializationFunctions = false } = {}): boolean {
  const functionsWithInjectionContext: ReadonlySet<string> = new Set([
    // see https://angular.dev/api/core/runInInjectionContext
    "runInInjectionContext",
    ...(includeAppInitializationFunctions ? [
      // see https://angular.dev/api/core/provideAppInitializer
      "provideAppInitializer",
      // see https://angular.dev/api/core/providePlatformInitializer
      "providePlatformInitializer",
      // see https://angular.dev/api/core/provideEnvironmentInitializer
      "provideEnvironmentInitializer",
      // see https://angular.dev/api/router/withViewTransitions
      "withViewTransitions",
    ] : [])
  ]);

  const callExpression = findNearestAncestorOf(
    node,
    (node) => node.type === AST_NODE_TYPES.CallExpression,
  );

  if (
    callExpression?.callee.type === AST_NODE_TYPES.Identifier &&
    functionsWithInjectionContext.has(callExpression.callee.name) &&
    !isAfterAwait(node)
  ) {
    return true;
  }

  return false;
}