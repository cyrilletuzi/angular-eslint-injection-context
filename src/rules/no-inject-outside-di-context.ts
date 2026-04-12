import type { RuleDefinition } from "@eslint/core";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { findAngularClassDecorator } from "../utils/angular-class-decorator";
import { isInAngularClassInitialization } from "../utils/angular-class-initialization";
import { isInFactoryFunction } from "../utils/angular-factory";
import { isInFunctionTypeWithInjectionContext } from "../utils/angular-function-type-with-injection-context";
import { isInFunctionWithInjectionContext } from "../utils/angular-function-with-injection-context";
import { isInjectionContextAsserted } from "../utils/angular-injection-context-assertion";
import { findNearestAncestorOf } from "../utils/ast-traversal";
import { isAfterAwait } from "../utils/await-detection";

export const ruleName = "no-inject-outside-di-context";

const INJECT_DOC = "https://angular.dev/api/core/inject";
const DEPENDENCY_INJECTION_CONTEXT_DOC =
  "https://angular.dev/guide/di/dependency-injection-context";

const methodsAndInterfacesWithInjectionContextMap: ReadonlyMap<string, string> =
  new Map<string, string>([
    ["canActivate", "CanActivate"],
    ["canActivateChild", "CanActivateChild"],
    ["canDeactivate", "CanDeactivate"],
    ["canMatch", "CanMatch"],
    ["resolve", "Resolve"],
    ["intercept", "HttpInterceptor"],
  ]);
export const methodsWithInjectionContext = Array.from(
  methodsAndInterfacesWithInjectionContextMap.keys(),
);

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
          isInInjectionContext(node)
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

function isInInjectionContext(node: TSESTree.Node): boolean {
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

function isInMethodWithInjectionContext(node: TSESTree.Node): boolean {
  // Check if the method name is one of the accepted ones like `canActivate`
  const methodDefinition = findNearestAncestorOf(
    node,
    (node) => node.type === AST_NODE_TYPES.MethodDefinition,
    { notInCallback: true },
  );

  if (
    methodDefinition?.key.type !== AST_NODE_TYPES.Identifier ||
    !methodsWithInjectionContext.includes(methodDefinition.key.name)
  ) {
    return false;
  }

  // Check if we are in an injectable Angular class
  const classDeclaration = findNearestAncestorOf(
    node,
    (node) => node.type === AST_NODE_TYPES.ClassDeclaration,
  );

  if (
    !classDeclaration ||
    !findAngularClassDecorator(classDeclaration)
  ) {
    return false;
  }

  // Check if the class implements the according accepted interface
  const implementName = methodsAndInterfacesWithInjectionContextMap.get(
    methodDefinition.key.name,
  );

  if (
    implementName !== undefined &&
    classDeclaration.implements.find(
      ({ expression }) =>
        expression.type === AST_NODE_TYPES.Identifier &&
        expression.name === implementName,
    ) !== undefined &&
    !isAfterAwait(node)
  ) {
    return true;
  }

  return false;
}

function isInRoute(node: TSESTree.Node): boolean {
  // Check the variable type is `Route` or `Routes`
  const variableDeclarator = findNearestAncestorOf(
    node,
    (node) => node.type === AST_NODE_TYPES.VariableDeclarator,
    { notInCallback: true },
  );

  const typeAnnotation = variableDeclarator?.id.typeAnnotation?.typeAnnotation;

  if (
    typeAnnotation?.type === AST_NODE_TYPES.TSTypeReference &&
    typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier &&
    ["Routes", "Route"].includes(typeAnnotation.typeName.name) &&
    !isAfterAwait(node)
  ) {
    return true;
  }

  return false;
}
