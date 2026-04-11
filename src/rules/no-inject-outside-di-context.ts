import type { RuleDefinition } from '@eslint/core';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { findNearestAncestorOf } from '../utils/find-nearest-ancestor-of';
import { findAngularClassDecorator } from '../utils/find-angular-class-decorator';

export const ruleName = 'no-inject-outside-di-context';

const INJECT_DOC = 'https://angular.dev/api/core/inject';
const DEPENDENCY_INJECTION_CONTEXT_DOC =
  'https://angular.dev/guide/di/dependency-injection-context';

const functionTypesWithInjectionContext: readonly string[] = [
  'CanActivateFn',
  'CanActivateChildFn',
  'CanDeactivateFn',
  'CanMatchFn',
  'ResolveFn',
  // see https://github.com/angular/angular/pull/64938
  'RunGuardsAndResolvers',
  // see https://github.com/angular/angular/pull/62133
  'LoadChildren',
  'LoadChildrenCallback',
  'HttpInterceptorFn',
  // see https://angular.dev/api/router/ViewTransitionsFeatureOptions#onViewTransitionCreated
  'ViewTransitionsFeatureOptions',
];
const methodsAndInterfacesWithInjectionContextMap: ReadonlyMap<string, string> =
  new Map<string, string>([
    ['canActivate', 'CanActivate'],
    ['canActivateChild', 'CanActivateChild'],
    ['canDeactivate', 'CanDeactivate'],
    ['canMatch', 'CanMatch'],
    ['resolve', 'Resolve'],
    ['intercept', 'HttpInterceptor'],
  ]);
const methodsWithInjectionContext = Array.from(
  methodsAndInterfacesWithInjectionContextMap.keys(),
);
const functionsWithInjectionContext: readonly string[] = [
  // see https://angular.dev/api/core/runInInjectionContext
  'runInInjectionContext',
  // see https://angular.dev/api/core/provideAppInitializer
  'provideAppInitializer',
  // see https://angular.dev/api/core/providePlatformInitializer
  'providePlatformInitializer',
  // see https://angular.dev/api/core/provideEnvironmentInitializer
  'provideEnvironmentInitializer',
  // see https://angular.dev/api/router/withViewTransitions
  'withViewTransitions',
];

export const ruleDefinition: RuleDefinition = {
  meta: {
    type: 'problem',
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
          node.callee.name !== 'inject' ||
          isInInjectionContext(node)
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'noInjectOutsideDiContext',
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
      isInFunctionTypeWithInjectionContext(parent) ||
      isInMethodWithInjectionContext(parent) ||
      isInRoute(parent) ||
      // Factories
      isInFactoryFunction(parent) ||
      // Special functions like `runInInjectionContext` and some application providers
      isInFunctionWithInjectionContext(parent) ||
      // Custom injectable functions where context is asserted
      isInjectionContextAsserted(parent))
  ) {
    return true;
  }

  return false;
}

function isInAngularClassInitialization(node: TSESTree.Node): boolean {
  // Start with field initializer, as it is the most common case, and it does not require traversal
  if (node.type === AST_NODE_TYPES.PropertyDefinition || isInProperty(node) || isInConstructor(node)) {
    const classDeclaration = findNearestAncestorOf(
      node,
      (node) => node.type === AST_NODE_TYPES.ClassDeclaration,
    );

    if (
      classDeclaration &&
      findAngularClassDecorator(classDeclaration)
    ) {
      return true;
    }
  }
  return false;
}

function isInProperty(node: TSESTree.Node): boolean {
  const propertyDefinition = findNearestAncestorOf(
    node,
    (node) => node.type === AST_NODE_TYPES.PropertyDefinition,
    { notInCallback: true },
  );
  if (propertyDefinition) {
    return true;
  }
  return false;
}

function isInConstructor(node: TSESTree.Node): boolean {
  const methodDefinition = findNearestAncestorOf(
    node,
    (node) => node.type === AST_NODE_TYPES.MethodDefinition,
    { notInCallback: true },
  );
  if (methodDefinition?.kind === 'constructor') {
    return true;
  }
  return false;
}

function isInFunctionTypeWithInjectionContext(node: TSESTree.Node): boolean {
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
    functionTypesWithInjectionContext.includes(typeAnnotation.typeName.name) &&
    !isAfterAwait(node)
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
    ['Routes', 'Route'].includes(typeAnnotation.typeName.name) &&
    !isAfterAwait(node)
  ) {
    return true;
  }

  return false;
}

function isInFactoryFunction(node: TSESTree.Node): boolean {
  const property = findNearestAncestorOf(
    node,
    (node) => node.type === AST_NODE_TYPES.Property,
    { notInCallback: true },
  );

  if (
    property &&
    (isPropertyInProviderFactory(property) ||
      isPropertyInInjectionTokenFactory(property) ||
      isPropertyInInjectableFactory(property))
  ) {
    return true;
  }

  return false;
}

function isPropertyInInjectionTokenFactory(
  property: TSESTree.PropertyComputedName | TSESTree.PropertyNonComputedName,
): boolean {
  // Check the property is inside a `new InjectionToken()`
  const newExpression = findNearestAncestorOf(
    property,
    (node) => node.type === AST_NODE_TYPES.NewExpression,
  );

  if (
    newExpression?.callee.type === AST_NODE_TYPES.Identifier &&
    newExpression.callee.name === 'InjectionToken'
  ) {
    return true;
  }

  return false;
}

function isPropertyInProviderFactory(
  property: TSESTree.PropertyComputedName | TSESTree.PropertyNonComputedName,
): boolean {
  // Check the property is called `useFactory`
  if (
    property.key.type !== AST_NODE_TYPES.Identifier ||
    property.key.name !== 'useFactory'
  ) {
    return false;
  }

  // Check the object contains another property called `provide`
  const objectExpression = findNearestAncestorOf(
    property,
    (node) => node.type === AST_NODE_TYPES.ObjectExpression,
  );

  const provideProperty = objectExpression?.properties.find(
    (objectProperty) =>
      objectProperty.type === AST_NODE_TYPES.Property &&
      objectProperty.key.type === AST_NODE_TYPES.Identifier &&
      objectProperty.key.name === 'provide',
  );

  if (provideProperty !== undefined) {
    return true;
  }

  return false;
}

function isPropertyInInjectableFactory(
  property: TSESTree.PropertyComputedName | TSESTree.PropertyNonComputedName,
): boolean {
  // Check the property is called `useFactory`
  if (
    property.key.type !== AST_NODE_TYPES.Identifier ||
    property.key.name !== 'useFactory'
  ) {
    return false;
  }

  // Check the property is inside an `Injectable()`
  const classDeclaration = findNearestAncestorOf(
    property,
    (node) => node.type === AST_NODE_TYPES.ClassDeclaration,
  );

  if (!classDeclaration) {
    return false;
  }

  if (findAngularClassDecorator(classDeclaration) === 'Injectable') {
    return true;
  }

  return false;
}

function isInFunctionWithInjectionContext(node: TSESTree.Node): boolean {
  const callExpression = findNearestAncestorOf(
    node,
    (node) => node.type === AST_NODE_TYPES.CallExpression,
  );

  if (
    callExpression?.callee.type === AST_NODE_TYPES.Identifier &&
    functionsWithInjectionContext.includes(callExpression.callee.name) &&
    !isAfterAwait(node)
  ) {
    return true;
  }

  return false;
}

function isInjectionContextAsserted(node: TSESTree.Node): boolean {
  // Check there is an `assertInInjectionContext` call in the same block
  const blockStatement = findNearestAncestorOf(
    node,
    (node) => node.type === AST_NODE_TYPES.BlockStatement,
    { notInCallback: true },
  );

  const assertCall = blockStatement?.body.find(
    (body) =>
      body.type === AST_NODE_TYPES.ExpressionStatement &&
      body.expression.type === 'CallExpression' &&
      body.expression.callee.type === AST_NODE_TYPES.Identifier &&
      body.expression.callee.name === 'assertInInjectionContext',
  );

  if (assertCall !== undefined) {
    return true;
  }

  const conditionalAssertCall = blockStatement?.body.find(
    (body) =>
      body.type === AST_NODE_TYPES.IfStatement &&
      body.consequent.type === AST_NODE_TYPES.BlockStatement &&
      body.consequent.body.find((consequentBody) =>
        consequentBody.type === AST_NODE_TYPES.ExpressionStatement &&
        consequentBody.expression.type === 'CallExpression' &&
        consequentBody.expression.callee.type === AST_NODE_TYPES.Identifier &&
        consequentBody.expression.callee.name === 'assertInInjectionContext',
      )
  );

  if (conditionalAssertCall !== undefined) {
    return true;
  }

  return false;
}

function isAfterAwait(node: TSESTree.Node): boolean {
  // Check there is an `await` expression in the same block, before the node
  const blockStatement = findNearestAncestorOf(
    node,
    (node) => node.type === AST_NODE_TYPES.BlockStatement,
    { notInCallback: true },
  );

  if (blockStatement === undefined) {
    return false;
  }

  const awaitExpression = blockStatement.body.find(
    (body) =>
      body.type === AST_NODE_TYPES.ExpressionStatement &&
      body.expression.type === AST_NODE_TYPES.AwaitExpression,
  );

  if (awaitExpression === undefined) {
    return false;
  }

  if (
    node.loc.end.line > awaitExpression.loc.start.line ||
    (node.loc.end.line === awaitExpression.loc.start.line &&
      node.loc.end.column > awaitExpression.loc.start.column)
  ) {
    return true;
  }

  return false;
}
