import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { findNearestAncestorOf } from "./ast-traversal";
import { isAfterAwait } from "./await-detection";

export function isInFunctionTypeWithInjectionContext(node: TSESTree.Node, { includeAppInitializationFunctions = false } = {}): boolean {
  const functionTypesWithInjectionContext: ReadonlySet<string> = new Set([
    "CanActivateFn",
    "CanActivateChildFn",
    "CanDeactivateFn",
    "CanMatchFn",
    "ResolveFn",
    // see https://github.com/angular/angular/pull/64938
    "RunGuardsAndResolvers",
    // see https://github.com/angular/angular/pull/62133
    "LoadChildren",
    "LoadChildrenCallback",
    "HttpInterceptorFn",
    ...(includeAppInitializationFunctions ? [
      // see https://angular.dev/api/router/ViewTransitionsFeatureOptions#onViewTransitionCreated
      "ViewTransitionsFeatureOptions",
    ] : [])
  ]);


  // Check the variable type is an accepted type like `CanActivateFn`
  const variableDeclarator = findNearestAncestorOf(
    node,
    (node) => node.type === AST_NODE_TYPES.VariableDeclarator,
    { notInCallback: true },
  );

  const typeAnnotation = variableDeclarator?.id.typeAnnotation?.typeAnnotation;

  if (
    typeAnnotation?.type === AST_NODE_TYPES.TSTypeReference &&
    typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier &&
    functionTypesWithInjectionContext.has(typeAnnotation.typeName.name) &&
    !isAfterAwait(node)
  ) {
    return true;
  }

  return false;
}