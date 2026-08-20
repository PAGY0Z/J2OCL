/*
 * Copyright (c) 2026 Pierre-Alexandre GROSSET
 * All Rights Reserved. Unauthorized copying, modification, or distribution
 * of this file, via any medium, is strictly prohibited.
 */

import ts from 'typescript';
import type { J2OCLType } from './j2ocl-type.js';

export interface LoweringAnchors
{
    getGlobalId: ts.FunctionDeclaration;
    types: ReadonlyMap<J2OCLType, ts.ClassDeclaration>;
}
