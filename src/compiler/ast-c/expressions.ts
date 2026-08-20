/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { CNode } from './node.js';
import type { CVisitor } from './visitor.js';

export class CLiteral extends CNode {
  constructor(readonly text: string) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitLiteral(this);
  }
}

export class CIdentifier extends CNode {
  constructor(readonly name: string) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitIdentifier(this);
  }
}

export class CBinaryExpr extends CNode {
  constructor(
    readonly operator: string,
    readonly left: CNode,
    readonly right: CNode,
  ) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}

export class CUnaryExpr extends CNode {
  constructor(
    readonly operator: string,
    readonly operand: CNode,
  ) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }
}

export class CAssignExpr extends CNode {
  constructor(
    readonly target: CNode,
    readonly value: CNode,
  ) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitAssignExpr(this);
  }
}

export class CCall extends CNode {
  constructor(
    readonly callee: string,
    readonly args: CNode[],
  ) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitCall(this);
  }
}

export class CIndexExpr extends CNode {
  constructor(
    readonly target: CNode,
    readonly index: CNode,
  ) {
    super();
  }

  accept<T>(visitor: CVisitor<T>): T {
    return visitor.visitIndexExpr(this);
  }
}
