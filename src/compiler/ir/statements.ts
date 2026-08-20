/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { Diagnostic } from '../diagnostic.js';
import type { J2OCLType } from '../j2ocl-type.js';
import { IRNode } from './node.js';
import type { IRVisitor } from './visitor.js';

export class IRBlock extends IRNode {
  constructor(readonly statements: IRNode[]) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitBlock(this);
  }
}

export class IRVariableDeclaration extends IRNode {
  constructor(
    readonly name: string,
    readonly type: J2OCLType,
    readonly initializer: IRNode,
  ) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitVariableDeclaration(this);
  }
}

export class IRExpressionStatement extends IRNode {
  constructor(readonly expression: IRNode) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitExpressionStatement(this);
  }
}

export class IRIf extends IRNode {
  constructor(
    readonly condition: IRNode,
    readonly thenBranch: IRBlock,
    readonly elseBranch: IRBlock | undefined,
  ) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitIf(this);
  }
}

export class IRFor extends IRNode {
  constructor(
    readonly init: IRNode | undefined,
    readonly condition: IRNode | undefined,
    readonly update: IRNode | undefined,
    readonly body: IRBlock,
  ) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitFor(this);
  }
}

export class IRWhile extends IRNode {
  constructor(
    readonly condition: IRNode,
    readonly body: IRBlock,
  ) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitWhile(this);
  }
}

export class IRDoWhile extends IRNode {
  constructor(
    readonly condition: IRNode,
    readonly body: IRBlock,
  ) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitDoWhile(this);
  }
}

export class IRInvalid extends IRNode {
  constructor(readonly diagnostic: Diagnostic) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitInvalid(this);
  }
}
