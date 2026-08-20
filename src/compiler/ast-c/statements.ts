/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { CNode } from './node.js';
import type { CVisitor } from './visitor.js';

export class CBlock extends CNode {
  constructor(readonly statements: CNode[]) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitBlock(this);
  }
}

export class CVariableDeclaration extends CNode {
  constructor(
    readonly cType: string,
    readonly name: string,
    readonly initializer: CNode,
  ) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitVariableDeclaration(this);
  }
}

export class CExpressionStatement extends CNode {
  constructor(readonly expression: CNode) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitExpressionStatement(this);
  }
}

export class CIf extends CNode {
  constructor(
    readonly condition: CNode,
    readonly thenBranch: CBlock,
    readonly elseBranch: CBlock | undefined,
  ) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitIf(this);
  }
}

export class CFor extends CNode {
  constructor(
    readonly init: CNode | undefined,
    readonly condition: CNode | undefined,
    readonly update: CNode | undefined,
    readonly body: CBlock,
  ) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitFor(this);
  }
}

export class CWhile extends CNode {
  constructor(
    readonly condition: CNode,
    readonly body: CBlock,
  ) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitWhile(this);
  }
}

export class CDoWhile extends CNode {
  constructor(
    readonly condition: CNode,
    readonly body: CBlock,
  ) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitDoWhile(this);
  }
}
