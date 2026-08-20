/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import { CAssignExpr, CBinaryExpr, CCall, CIdentifier, CIndexExpr, CLiteral, CUnaryExpr } from './ast-c/expressions.js';
import { CBlock, CDoWhile, CExpressionStatement, CFor, CIf, CVariableDeclaration, CWhile } from './ast-c/statements.js';
import { CFunction, type CParameter } from './ast-c/function.js';
import type { CNode } from './ast-c/node.js';
import type { IRAssignExpr, IRIdentifier, IRIntrinsicCall, IRLiteral, IRMethodCall } from './ir/expressions.js';
import type { IRBlock, IRDoWhile, IRExpressionStatement, IRFor, IRIf, IRInvalid, IRVariableDeclaration, IRWhile } from './ir/statements.js';
import type { IRVisitor } from './ir/visitor.js';
import type { LoweredKernel } from './lowering/kernel.js';
import { lookupOperator } from './operator-mapping.js';
import { parameterCType, scalarCType } from './type-mapping.js';

const INTRINSIC_C_NAMES: Record<string, string> = {
    getGlobalId: 'get_global_id',
};

function formatLiteral(node: IRLiteral): string
{
    if (typeof node.value === 'boolean')
    {
        return node.value ? 'true' : 'false';
    }
    const raw = String(node.value);
    if (node.type === 'Float32' || node.type === 'Float64')
    {
        const withDecimalPoint = /[.eE]/.test(raw) ? raw : `${raw}.0`;
        return node.type === 'Float32' ? `${withDecimalPoint}f` : withDecimalPoint;
    }
    if (node.type.startsWith('U') || node.type === 'UInt64') return `${raw}u`;
    return raw;
}

export class IrToCVisitor implements IRVisitor<CNode>
{
    visitLiteral(node: IRLiteral): CNode
    {
        return new CLiteral(formatLiteral(node));
    }

    visitIdentifier(node: IRIdentifier): CNode
    {
        return new CIdentifier(node.name);
    }

    visitMethodCall(node: IRMethodCall): CNode
    {
        if (node.methodName === 'get')
        {
            const [index] = node.args;
            return new CIndexExpr(node.receiver.accept(this), index.accept(this));
        }
        if (node.methodName === 'set')
        {
            const [index, value] = node.args;
            return new CAssignExpr(new CIndexExpr(node.receiver.accept(this), index.accept(this)), value.accept(this));
        }

        const operator = lookupOperator(node.methodName);
        if (!operator)
        {
            throw new Error(`IrToCVisitor: no operator mapping for method "${node.methodName}"`);
        }
        if (operator.kind === 'unary-prefix')
        {
            return new CUnaryExpr(operator.symbol, node.receiver.accept(this));
        }
        const [argument] = node.args;
        return new CBinaryExpr(operator.symbol, node.receiver.accept(this), argument.accept(this));
    }

    visitIntrinsicCall(node: IRIntrinsicCall): CNode
    {
        const callee = INTRINSIC_C_NAMES[node.name];
        if (!callee)
        {
            throw new Error(`IrToCVisitor: no C mapping for intrinsic "${node.name}"`);
        }
        return new CCall(
            callee,
            node.args.map((arg) => arg.accept(this)),
        );
    }

    visitAssignExpr(node: IRAssignExpr): CNode
    {
        return new CAssignExpr(node.target.accept(this), node.value.accept(this));
    }

    visitBlock(node: IRBlock): CNode
    {
        return new CBlock(node.statements.map((statement) => statement.accept(this)));
    }

    visitVariableDeclaration(node: IRVariableDeclaration): CNode
    {
        return new CVariableDeclaration(scalarCType(node.type), node.name, node.initializer.accept(this));
    }

    visitExpressionStatement(node: IRExpressionStatement): CNode
    {
        return new CExpressionStatement(node.expression.accept(this));
    }

    visitIf(node: IRIf): CNode
    {
        return new CIf(node.condition.accept(this), node.thenBranch.accept(this) as CBlock, node.elseBranch ? (node.elseBranch.accept(this) as CBlock) : undefined);
    }

    visitFor(node: IRFor): CNode
    {
        return new CFor(node.init?.accept(this), node.condition?.accept(this), node.update?.accept(this), node.body.accept(this) as CBlock);
    }

    visitWhile(node: IRWhile): CNode
    {
        return new CWhile(node.condition.accept(this), node.body.accept(this) as CBlock);
    }

    visitDoWhile(node: IRDoWhile): CNode
    {
        return new CDoWhile(node.condition.accept(this), node.body.accept(this) as CBlock);
    }

    visitInvalid(node: IRInvalid): CNode
    {
        throw new Error(`IrToCVisitor: cannot emit an IRInvalid node — compileKernel must never call emission when diagnostics are present (${node.diagnostic.message})`);
    }
}

export function emitKernel(kernel: LoweredKernel, visitor: IrToCVisitor): CFunction
{
    const parameters: CParameter[] = kernel.parameters.map((parameter) => ({
        cType: parameterCType(parameter.type),
        name: parameter.name,
    }));
    return new CFunction(kernel.name, parameters, kernel.body.accept(visitor) as CBlock);
}
