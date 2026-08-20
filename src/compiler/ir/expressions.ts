/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import type { J2OCLType } from '../j2ocl-type.js';
import { IRNode } from './node.js';
import type { IRVisitor } from './visitor.js';

export class IRLiteral extends IRNode {
  constructor(
    readonly value: number | bigint | boolean,
    readonly type: J2OCLType,
  ) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitLiteral(this);
  }
}

export class IRIdentifier extends IRNode {
  constructor(
    readonly name: string,
    readonly type: J2OCLType,
  ) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitIdentifier(this);
  }
}

export class IRMethodCall extends IRNode {
  constructor(
    readonly receiver: IRNode,
    readonly methodName: string,
    readonly args: IRNode[],
    readonly type: J2OCLType,
  ) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitMethodCall(this);
  }
}

export class IRIntrinsicCall extends IRNode {
  constructor(
    readonly name: string,
    readonly args: IRNode[],
    readonly type: J2OCLType,
  ) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitIntrinsicCall(this);
  }
}

export class IRAssignExpr extends IRNode {
  constructor(
    readonly target: IRIdentifier,
    readonly value: IRNode,
    readonly type: J2OCLType,
  ) {
    super();
  }

  accept<T>(visitor: IRVisitor<T>): T {
    return visitor.visitAssignExpr(this);
  }
}
