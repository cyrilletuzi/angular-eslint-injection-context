import { AST_NODE_TYPES, ASTUtils, type TSESTree } from "@typescript-eslint/utils";

export type AngularClassDecorator = "Component" | "Directive" | "Injectable" | "NgModule" | "Pipe";

/**
 * Checks if a `ClassDeclaration` has an Angular decorator and returns it.
 * 
 * @example
 * ```typescript
 * const classDeclaration = findNearestAncestorOf(
 *   node,
 *   (node) => node.type === AST_NODE_TYPES.ClassDeclaration,
 * );
 *
 * if (classDeclaration && findAngularClassDecorator(classDeclaration)) {
 *   return true;
 * }
 * ```
 */
export function findAngularClassDecorator({ decorators }: TSESTree.ClassDeclaration): AngularClassDecorator | undefined {
  return decorators
    ?.map(({ expression }): string | undefined => {
      if (ASTUtils.isIdentifier(expression)) {
        return expression.name;
      }

      return expression.type === AST_NODE_TYPES.CallExpression &&
        ASTUtils.isIdentifier(expression.callee)
        ? expression.callee.name
        : undefined;
    })
    .filter((item) => item !== undefined)
    .find((value): value is AngularClassDecorator => {
      const angularClassDecorators: ReadonlySet<AngularClassDecorator> = new Set([
        "Component", "Directive", "Injectable", "NgModule", "Pipe"
      ]);
      return angularClassDecorators.has(value as AngularClassDecorator);
    });
};