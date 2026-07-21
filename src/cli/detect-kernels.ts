/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';

/**
 * A single resolved parameter of a detected kernel method — one entry per argument the
 * method declares, in declaration order (e.g. `input` then `out` for
 * `static double(input, out) {}`).
 */
export interface KernelParameter {
  /** The parameter's name, exactly as written in the source (e.g. `"input"`). */
  name: string;
  /** The parameter's type, as resolved by the TypeScript checker. */
  type: ts.Type;
}

/**
 * Everything needed to identify, locate, and later compile a detected kernel method.
 * `detectKernels` produces one of these per `@kernel`-decorated method it finds.
 */
export interface KernelDescriptor {
  /** A unique, human-readable identifier: `"<file path>#<ClassName>.<methodName>"`. */
  id: string;
  /** Path of the source file the kernel method is declared in. */
  filePath: string;
  /** 1-based line number where the kernel method starts (for error messages/tooling). */
  line: number;
  /** 1-based column number where the kernel method starts. */
  column: number;
  /** The name of the class the kernel method belongs to. */
  className: string;
  /** The name of the kernel method itself. */
  methodName: string;
  /** The kernel method's body — the untouched AST node, ready for later compilation. */
  body: ts.Block;
  /** The kernel method's parameters, in declaration order. */
  parameters: KernelParameter[];
}

/**
 * The real `Kernel` base class and `kernel` decorator declarations to match candidates
 * against. Callers resolve these however is appropriate for their context (a real
 * consumer project resolves them from its own import of `j2ocl`; tests can supply a
 * synthetic pair) — `detectKernels` only ever compares resolved symbols, never names.
 */
export interface KernelAnchors {
  /** The real `Kernel` base class declaration, wherever it was imported from. */
  kernelClass: ts.ClassDeclaration;
  /** The real `kernel` decorator function declaration, wherever it was imported from. */
  kernelDecorator: ts.FunctionDeclaration;
}

/**
 * Follows a symbol through import/re-export aliasing to the symbol of its original
 * declaration, so two references to the same declaration compare equal regardless of
 * how each was imported.
 *
 * In plain terms: TypeScript gives every declared name its own `Symbol`, but importing
 * (or re-exporting) that name creates a second, "alias" symbol that just points at the
 * original one. Comparing alias symbols directly (`===`) would wrongly treat two
 * imports of the *same* declaration as different things, so this function follows the
 * alias chain until it reaches the real, original symbol.
 *
 * @param checker - The program's type checker.
 * @param symbol - The symbol to resolve.
 * @returns The original, non-alias symbol.
 */
function resolveToOriginalSymbol(
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
): ts.Symbol {
  let resolved = symbol;
  // `Alias` means this symbol just points at another one (e.g. an import); follow it.
  while ((resolved.flags & ts.SymbolFlags.Alias) !== 0) {
    resolved = checker.getAliasedSymbol(resolved);
  }
  return resolved;
}

/**
 * Resolves the real, de-aliased symbols for the anchor `Kernel` class and `kernel`
 * decorator declarations, to compare candidates against.
 *
 * @param checker - The program's type checker.
 * @param anchors - The real `Kernel`/`kernel` declarations.
 * @returns The resolved anchor symbols.
 * @throws {Error} If either anchor declaration is unnamed or fails to resolve to a symbol.
 */
function resolveAnchorSymbols(
  checker: ts.TypeChecker,
  anchors: KernelAnchors,
): { kernelClassSymbol: ts.Symbol; kernelDecoratorSymbol: ts.Symbol } {
  const kernelClassNameNode = anchors.kernelClass.name;
  const kernelDecoratorNameNode = anchors.kernelDecorator.name;
  if (!kernelClassNameNode || !kernelDecoratorNameNode) {
    throw new Error('detectKernels: anchor declarations must be named');
  }

  const kernelClassSymbol = checker.getSymbolAtLocation(kernelClassNameNode);
  const kernelDecoratorSymbol = checker.getSymbolAtLocation(
    kernelDecoratorNameNode,
  );
  if (!kernelClassSymbol || !kernelDecoratorSymbol) {
    throw new Error(
      'detectKernels: could not resolve anchor declarations to symbols',
    );
  }

  return {
    kernelClassSymbol: resolveToOriginalSymbol(checker, kernelClassSymbol),
    kernelDecoratorSymbol: resolveToOriginalSymbol(
      checker,
      kernelDecoratorSymbol,
    ),
  };
}

/**
 * Determines whether `classDeclaration` extends the anchor `Kernel` class, directly or
 * through any number of intermediate subclasses.
 *
 * In plain terms: this climbs the `extends` chain one class at a time — `class C
 * extends B`, `class B extends A`, and so on — comparing each ancestor's resolved
 * symbol against the real `Kernel` symbol, until it finds a match or runs out of
 * ancestors to check.
 *
 * @param checker - The program's type checker.
 * @param classDeclaration - The class to check.
 * @param kernelClassSymbol - The resolved anchor `Kernel` symbol.
 * @returns `true` if `Kernel` is somewhere in `classDeclaration`'s extends chain.
 */
function classExtendsKernel(
  checker: ts.TypeChecker,
  classDeclaration: ts.ClassDeclaration,
  kernelClassSymbol: ts.Symbol,
): boolean {
  let currentClass: ts.ClassDeclaration | undefined = classDeclaration;

  while (currentClass) {
    const extendsClause = currentClass.heritageClauses?.find(
      (clause) => clause.token === ts.SyntaxKind.ExtendsKeyword,
    );
    const parentExpression = extendsClause?.types[0]?.expression;
    // No `extends` clause here means the chain ends without ever reaching Kernel.
    if (!parentExpression) return false;

    const parentSymbol = checker.getSymbolAtLocation(parentExpression);
    if (!parentSymbol) return false;

    const resolvedParentSymbol = resolveToOriginalSymbol(checker, parentSymbol);
    if (resolvedParentSymbol === kernelClassSymbol) return true;

    // Step one level further up: the parent's own class declaration, if it has one.
    currentClass = resolvedParentSymbol.declarations?.find(
      ts.isClassDeclaration,
    );
  }

  return false;
}

/**
 * Returns `true` if `method` carries the `static` modifier. Takes a `MethodDeclaration`
 * specifically (rather than a general `ts.Node`) because method declarations can always
 * carry modifiers — there is no "can't have modifiers" case to guard against here.
 *
 * @param method - The method to check.
 * @returns `true` if one of `method`'s modifiers is `static`.
 */
function hasStaticModifier(method: ts.MethodDeclaration): boolean {
  const modifiers = ts.getModifiers(method);
  if (!modifiers) return false;
  return modifiers.some(
    (modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword,
  );
}

/**
 * Finds the decorator on `member`, if any, that resolves to the anchor `kernel`
 * decorator — matching by resolved symbol, so it's found regardless of how it was
 * imported or aliased. Handles both a bare reference (`@kernel`) and a call
 * (`@kernel()`).
 *
 * @param checker - The program's type checker.
 * @param member - The class member to check.
 * @param kernelDecoratorSymbol - The resolved anchor `kernel` decorator symbol.
 * @returns The matching decorator node, or `undefined` if none of `member`'s decorators
 * resolve to it.
 */
function getKernelDecorator(
  checker: ts.TypeChecker,
  member: ts.ClassElement,
  kernelDecoratorSymbol: ts.Symbol,
): ts.Decorator | undefined {
  // Some class elements (e.g. a `static { ... }` block) can never carry a decorator.
  if (!ts.canHaveDecorators(member)) return undefined;
  const decorators = ts.getDecorators(member);
  if (!decorators) return undefined;

  for (const decorator of decorators) {
    // `@kernel` is a bare reference; `@kernel()` is a call — unwrap the call to reach
    // the same underlying reference either way.
    const expression = ts.isCallExpression(decorator.expression)
      ? decorator.expression.expression
      : decorator.expression;
    const symbol = checker.getSymbolAtLocation(expression);
    if (
      symbol &&
      resolveToOriginalSymbol(checker, symbol) === kernelDecoratorSymbol
    ) {
      return decorator;
    }
  }

  return undefined;
}

/**
 * The outcome of checking whether a `@kernel`-decorated class member is a legally
 * placed kernel: a static method of a class that extends `Kernel`.
 */
type MemberValidation =
  | { valid: true; method: ts.MethodDeclaration } // accepted: the narrowed, legal method
  | { valid: false; reason: string }; // rejected: a human-readable reason why

/**
 * Checks whether a class member decorated with the real `kernel` decorator is placed
 * legally. This re-checks constraints the decorator's own generic signature and
 * runtime guard are meant to enforce, in case a `@ts-expect-error`/`@ts-ignore` bypassed
 * them in source this function only reads, never executes.
 *
 * @param member - The decorated class member.
 * @param extendsKernel - Whether the containing class extends the anchor `Kernel`.
 * @returns A valid result carrying the narrowed method, or an invalid result with the
 * reason it was rejected.
 */
function validateKernelMember(
  member: ts.ClassElement,
  extendsKernel: boolean,
): MemberValidation {
  if (!extendsKernel) {
    return { valid: false, reason: 'its class does not extend Kernel' };
  }
  if (!ts.isMethodDeclaration(member) || !hasStaticModifier(member)) {
    return { valid: false, reason: 'it is not a static method' };
  }
  return { valid: true, method: member };
}

/**
 * Builds the descriptor for one confirmed-valid kernel method.
 *
 * @param checker - The program's type checker.
 * @param sourceFile - The source file the method is declared in.
 * @param classDeclaration - The method's containing class.
 * @param method - The kernel method itself.
 * @returns The method's descriptor.
 * @throws {Error} If the class or method is unnamed, or the method has no body — none
 * of which valid `@kernel` usage can produce, but each would make the descriptor
 * meaningless.
 */
function buildDescriptor(
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
  classDeclaration: ts.ClassDeclaration,
  method: ts.MethodDeclaration,
): KernelDescriptor {
  const className = classDeclaration.name?.text;
  const methodName = ts.isIdentifier(method.name)
    ? method.name.text
    : undefined;
  if (!className || !methodName) {
    throw new Error(
      'detectKernels: kernel classes and methods must have a name',
    );
  }
  if (!method.body) {
    throw new Error(
      `detectKernels: @kernel method ${className}.${methodName} has no body`,
    );
  }

  // TypeScript reports positions as 0-based; convert to the 1-based line/column
  // convention editors and error messages normally use.
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    method.getStart(),
  );
  const parameters: KernelParameter[] = method.parameters.map((parameter) => ({
    // Most parameters have a simple name; a destructuring pattern like `[a, b]` has no
    // single name, so fall back to its literal source text.
    name: ts.isIdentifier(parameter.name)
      ? parameter.name.text
      : parameter.name.getText(),
    type: checker.getTypeAtLocation(parameter),
  }));

  return {
    id: `${sourceFile.fileName}#${className}.${methodName}`,
    filePath: sourceFile.fileName,
    line: line + 1,
    column: character + 1,
    className,
    methodName,
    body: method.body,
    parameters,
  };
}

/**
 * Finds every `@kernel`-decorated static method, on a class extending `Kernel`,
 * anywhere in `program`. Matches `Kernel`/`kernel` usages by resolved TypeScript symbol
 * against `anchors`, never by name, so unrelated homonymous declarations are ignored.
 *
 * This is detection only — it never executes any of the analyzed code, and it does not
 * lower results to an intermediate representation or emit OpenCL C.
 *
 * @param program - The program to scan; every non-declaration source file in it is
 * checked.
 * @param anchors - The real `Kernel` class and `kernel` decorator declarations to match
 * against.
 * @returns One descriptor per valid kernel method found, in source-file/declaration
 * order.
 * @throws {Error} If a `@kernel`-decorated member is found whose placement violates a
 * constraint the decorator's own type/runtime checks are meant to enforce (wrong class
 * ancestry, or not a static method) — this can only happen if a `@ts-expect-error` or
 * `@ts-ignore` bypassed that constraint in the analyzed source.
 */
export function detectKernels(
  program: ts.Program,
  anchors: KernelAnchors,
): KernelDescriptor[] {
  const checker = program.getTypeChecker();
  const { kernelClassSymbol, kernelDecoratorSymbol } = resolveAnchorSymbols(
    checker,
    anchors,
  );
  const descriptors: KernelDescriptor[] = [];

  // Checks one class's own members for @kernel usage. Declared inside detectKernels so
  // it can add straight to `descriptors` via closure, instead of returning and merging.
  function visitClass(classDeclaration: ts.ClassDeclaration): void {
    const extendsKernel = classExtendsKernel(
      checker,
      classDeclaration,
      kernelClassSymbol,
    );
    const sourceFile = classDeclaration.getSourceFile();

    for (const member of classDeclaration.members) {
      const decorator = getKernelDecorator(
        checker,
        member,
        kernelDecoratorSymbol,
      );
      if (!decorator) continue;

      const validation = validateKernelMember(member, extendsKernel);
      if (!validation.valid) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          decorator.getStart(),
        );
        throw new Error(
          `detectKernels: invalid @kernel usage at ${sourceFile.fileName}:${line + 1}:${character + 1} — ${validation.reason}`,
        );
      }

      descriptors.push(
        buildDescriptor(
          checker,
          sourceFile,
          classDeclaration,
          validation.method,
        ),
      );
    }
  }

  // Walks one source file's whole AST, looking for class declarations to check.
  function visitNode(node: ts.Node): void {
    if (ts.isClassDeclaration(node)) {
      visitClass(node);
    }
    ts.forEachChild(node, visitNode);
  }

  for (const sourceFile of program.getSourceFiles()) {
    // Declaration files (.d.ts) hold only type information, never real kernel bodies.
    if (!sourceFile.isDeclarationFile) {
      visitNode(sourceFile);
    }
  }

  return descriptors;
}
